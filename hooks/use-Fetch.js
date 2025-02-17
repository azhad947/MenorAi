import { toast } from "sonner"

const { useState } = require("react")

const useFetch  = (cb) => { 
    const [data , setData] = useState(undefined)
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    
    const  fn = async (...args) => {
       setIsLoading(true);
       setError(null);
       try {
        const response = await cb(...args)
        setData(response);
        setError(null)
       } catch (error) {
        setError(error)
        console.error(error)
        toast.error(error.message)
       } finally {
        setIsLoading(false);
       }
    }

    return {
        data , setData , fn , error , isLoading
    }

}

export default useFetch;