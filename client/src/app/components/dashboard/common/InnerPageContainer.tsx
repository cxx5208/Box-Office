export default function InnerPageContainer({title, children}: { title: string, children: React.ReactNode}){
    return(
        <div className="m-auto ngrid place-items-center max-w-2xl bg-base-100 pb-48">
            <div className="max-w-5xl content-center flex-col justify-center">
                <h1 className="text-5xl mt-16 mb-12 font-bold text-center block">{title}</h1>
                <div className="">
                    {children}
                </div>
            </div>
        </div>
    )
}