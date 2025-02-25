import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const handleSuccess=(message,toastId)=>{
    if(toastId && !toast.isActive(toastId)){
        toast.success(message,{
                   position:'top-right',
                   autoClose:4000,
                   toastId
                 })
    }
}

export const handleError=(message,toastId)=>{
    if(toastId && !toast.isActive(toastId)){
        toast.error(message,{
            position:'top-right',
            autoClose:4000,
            toastId
        })
    }
   
}

export const handleWarning=(message,toastId)=>{
    if(toastId && !toast.isActive(toastId))
    toast.warning(message,{
        position:"top-right",
        autoClose:4000,
        toastId
    })
}

