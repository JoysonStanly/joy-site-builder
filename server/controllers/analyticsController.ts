import { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const trackActivity = async (req: Request, res: Response) => {
  try {
    const { projectId, eventType, country, device, referrer, duration } = req.body;

    if (!projectId || !eventType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (eventType !== 'view' && eventType !== 'click') {
      return res.status(400).json({ message: 'Invalid eventType' });
    }

    await prisma.analytics.create({
      data: {
        projectId,
        eventType,
        country: country || 'Unknown',
        device: device || 'Unknown',
        referrer: referrer || 'Direct',
        duration: duration || null,
      },
    });

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getAnalyticsSummary = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { projectId } = req.params;
    const { range = '7' } = req.query;
    const days = parseInt(range as string) || 7;

    // Verify ownership
    const project = await prisma.websiteProject.findUnique({
      where: { id: projectId, userId },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const prevStartDate = new Date();
    prevStartDate.setDate(now.getDate() - (days * 2 - 1));
    prevStartDate.setHours(0, 0, 0, 0);

    // Current period data
    const analyticsData = await prisma.analytics.findMany({
      where: { projectId, createdAt: { gte: startDate } },
      orderBy: { createdAt: 'asc' },
    });

    // Previous period data for comparison
    const prevAnalyticsData = await prisma.analytics.findMany({
      where: { projectId, createdAt: { gte: prevStartDate, lt: startDate } },
      orderBy: { createdAt: 'asc' },
    });

    let totalViews = 0;
    let totalClicks = 0;
    let totalDuration = 0;
    let durationCount = 0;
    const viewsPerDayMap: Record<string, number> = {};
    const clicksPerDayMap: Record<string, number> = {};
    const deviceMap: Record<string, number> = {};
    const referrerMap: Record<string, number> = {};
    const countryMap: Record<string, number> = {};

    analyticsData.forEach((record: any) => {
      const dateStr = record.createdAt.toISOString().split('T')[0];

      if (record.eventType === 'view') {
        totalViews++;
        viewsPerDayMap[dateStr] = (viewsPerDayMap[dateStr] || 0) + 1;
        if (record.device) deviceMap[record.device] = (deviceMap[record.device] || 0) + 1;
        if (record.referrer) referrerMap[record.referrer] = (referrerMap[record.referrer] || 0) + 1;
        if (record.country) countryMap[record.country] = (countryMap[record.country] || 0) + 1;
        if (record.duration) { totalDuration += record.duration; durationCount++; }
      } else if (record.eventType === 'click') {
        totalClicks++;
        clicksPerDayMap[dateStr] = (clicksPerDayMap[dateStr] || 0) + 1;
      }
    });

    // Previous period totals
    let prevViews = 0;
    let prevClicks = 0;
    prevAnalyticsData.forEach((record: any) => {
      if (record.eventType === 'view') prevViews++;
      else if (record.eventType === 'click') prevClicks++;
    });

    // vs last period percentage
    const viewsChange = prevViews > 0 ? (((totalViews - prevViews) / prevViews) * 100).toFixed(1) : null;
    const clicksChange = prevClicks > 0 ? (((totalClicks - prevClicks) / prevClicks) * 100).toFixed(1) : null;

    // Generate date range
    const dateRange = Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (days - 1 - i));
      return d.toISOString().split('T')[0];
    });

    const viewsPerDay = dateRange.map((date) => ({
      date,
      views: viewsPerDayMap[date] || 0,
    }));

    const clicksPerDay = dateRange.map((date) => ({
      date,
      clicks: clicksPerDayMap[date] || 0,
    }));

    const clickRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';
    const avgDuration = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;

    // Top items
    const topDevices = Object.entries(deviceMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const topReferrers = Object.entries(referrerMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const topCountries = Object.entries(countryMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);

    res.json({
      totalViews,
      totalClicks,
      clickRate,
      avgDuration,
      viewsChange,
      clicksChange,
      viewsPerDay,
      clicksPerDay,
      topDevices,
      topReferrers,
      topCountries,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};