import { Suspense } from "react";
import { BarLoader } from "react-spinners";


export default function Layout({children}){
   return (
    <div className="">
        <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="gray" />}>
            {children}
        </Suspense>
    </div>
   )
}