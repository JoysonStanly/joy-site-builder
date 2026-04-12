import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { Loader2Icon } from "lucide-react";
import ProjectPreview from "../components/ProjectPreview";
import type { Project } from "../types";
import api from "@/configs/axios";
import { toast } from "sonner";
import type { AxiosError } from "axios";

const View = () => {
  const { projectId } = useParams();
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let cancelled = false;

    api.get(`/api/project/published/${projectId}`)
      .then(({ data }) => {
        if (cancelled) return;
        setCode(data.code)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const error = err as AxiosError<{message: string}>;
        toast.error(error?.response?.data?.message || error.message);
        console.log(error);
        setLoading(false)
      });

    return () => {
      cancelled = true;
    }
  },[projectId])

  if(loading){
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2Icon className='size-7 animate-spin text-indigo-200' />
      </div>
    )
  }

  return (
    <div className="h-screen">
      {code && <ProjectPreview project={{current_code: code} as Project} isGenerating={false} showEditorPanel={false}/>}
    </div>
  )
}

export default View
