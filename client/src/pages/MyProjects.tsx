import React, { useEffect, useState } from 'react'
import type { Project } from '../types';
import { Loader2Icon, PlusIcon, TrashIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import api from '@/configs/axios';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { AxiosError } from 'axios';

const MyProjects = () => {
    const { data: session, isPending } = authClient.useSession()
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([])
    const navigate = useNavigate()

    const fetchProjects = async () => {
        try {
            const { data } = await api.get('/api/user/projects')
            setProjects(data.projects)
            setLoading(false)
        } catch (error: unknown) {
            console.log(error);
            const message = error instanceof AxiosError
                ? error.response?.data?.message
                : error instanceof Error
                    ? error.message
                    : undefined;
            toast.error(message || 'Failed to load projects')
        }
    }

    const deleteProject = async (projectId: string) => {
        try {
            const confirm = window.confirm('Are you sure you want to delete this project?');
            if (!confirm) return;

            const { data } = await api.delete(`/api/project/${projectId}`)
            toast.success(data.message);
            fetchProjects()
        } catch (error: unknown) {
            console.log(error);
            const message = error instanceof AxiosError
                ? error.response?.data?.message
                : error instanceof Error
                    ? error.message
                    : undefined;
            toast.error(message || 'Failed to delete project')
        }
    }

    useEffect(() => {
        if (isPending) {
            return;
        }

        if (session?.user) {
            void fetchProjects();
        } else {
            navigate('/');
            toast('Please login to view your projects');
        }
    }, [isPending, navigate, session?.user])

    return (
        <>
            <div className='px-4 md:px-16 lg:px-24 xl:px-32'>
                {loading ? (
                    <div className='flex items-center justify-center h-[80vh]'>
                        <Loader2Icon className='size-7 animate-spin text-indigo-200' />
                    </div>
                ) : projects.length > 0 ? (
                    <div className='py-10 min-h-[80vh]'>

                        {/* Header */}
                        <div className='flex items-center justify-between mb-10'>
                            <h1 className='text-2xl font-semibold text-white'>My Projects</h1>
                            <button
                                onClick={() => navigate('/')}
                                className='flex items-center gap-2 text-white px-4 py-2 rounded-md bg-gradient-to-br from-indigo-500 to-indigo-600 hover:opacity-90 active:scale-95 transition-all'
                            >
                                <PlusIcon size={18} /> Create New
                            </button>
                        </div>

                        {/* Grid Layout */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                    className='relative group cursor-pointer bg-gray-900/60 border border-gray-700 rounded-xl overflow-hidden shadow-md hover:shadow-indigo-700/30 hover:border-indigo-800/80 transition-all duration-300'
                                >

                                    {/* Preview */}
                                    <div className='relative w-full h-40 bg-gray-900 overflow-hidden border-b border-gray-800'>
                                        {project.current_code ? (
                                            <iframe
                                                srcDoc={project.current_code}
                                                className='absolute top-0 left-0 w-[1200px] h-[800px] origin-top-left pointer-events-none'
                                                sandbox='allow-scripts allow-same-origin'
                                                style={{ transform: 'scale(0.25)' }}
                                            />
                                        ) : (
                                            <div className='flex items-center justify-center h-full text-gray-500'>
                                                <p>No Preview</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className='p-4 text-white'>

                                        {/* Title */}
                                        <div className='flex items-start justify-between gap-2'>
                                            <h2 className='text-lg font-semibold line-clamp-2'>
                                                {project.name}
                                            </h2>
                                            <span className='px-2 py-0.5 text-xs bg-gray-800 border border-gray-700 rounded-full'>
                                                Website
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <p className='text-gray-400 mt-1 text-sm line-clamp-2'>
                                            {project.initial_prompt}
                                        </p>

                                        {/* Bottom */}
                                        <div
                                            onClick={(e) => e.stopPropagation()}
                                            className='mt-5 flex flex-col gap-3'
                                        >
                                            <span className='text-xs text-gray-500'>
                                                {new Date(project.createdAt).toLocaleDateString()}
                                            </span>

                                            {/* Buttons */}
                                            <div className='flex gap-2'>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/analytics/${project.id}`);
                                                    }}
                                                    className='flex-1 text-xs py-2 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-md transition'
                                                >
                                                    Analytics
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/preview/${project.id}`);
                                                    }}
                                                    className='flex-1 text-xs py-2 bg-green-500/20 hover:bg-green-500/30 rounded-md transition'
                                                >
                                                    Preview
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/projects/${project.id}`);
                                                    }}
                                                    className='flex-1 text-xs py-2 bg-white/10 hover:bg-white/20 rounded-md transition'
                                                >
                                                    Open
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Delete */}
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <TrashIcon
                                            className='absolute top-3 right-3 scale-0 group-hover:scale-100 bg-white p-1.5 size-7 rounded text-red-500 cursor-pointer transition-all'
                                            onClick={() => deleteProject(project.id)}
                                        />
                                    </div>

                                </div>
                            ))}
                        </div>

                    </div>
                ) : (
                    <div className='flex flex-col items-center justify-center h-[80vh]'>
                        <h1 className='text-3xl font-semibold text-gray-300'>
                            You have no projects yet!
                        </h1>
                        <button
                            onClick={() => navigate('/')}
                            className='text-white px-5 py-2 mt-5 rounded-md bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition-all'
                        >
                            Create New
                        </button>
                    </div>
                )}
            </div>

            <Footer />
        </>
    )
}

export default MyProjects