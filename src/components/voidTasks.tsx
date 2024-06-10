import Image from "next/image";
import IconVoidTaks from "@/assets/iconVoidTaks.svg";

export function IntarfaceVoidTasks() {
    return (
        <>
            <div className="w-full border-t border-gray-400 rounded-xl flex flex-col items-center justify-center py-16 gap-2">
                <Image
                    src={IconVoidTaks}
                    alt="Icon lista de tarefas vazia"
                />
                <p className="text-center"><strong>Você ainda não tem tarefas cadastradas<br/></strong>Crie tarefas e organize seus itens a fazer</p>
            </div>
        </>
    );
}