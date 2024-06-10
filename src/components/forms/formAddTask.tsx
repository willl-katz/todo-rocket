"use client"
import ContainerGrid from "../container";
import { InputForm } from "../customInputs/input";
import { Bounce, toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { CreateTask } from "@/services/task";

// Config para validar e pegar os dados do formulário
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

const schemaDefinitionTask = yup.object({
    task: yup.string().trim().required("Digite a tarefa que deseja realizar"),
}).required();

type SubmitTaskProps = {
    task: string
}

type TaskProps = {
    id: number;
    setStateAddTask: Dispatch<SetStateAction<boolean>>;
}

type ListTasksUserProps = [
    {
        id: number;
        descricao: string;
        concluido: boolean;
    }
]

export default function FormTasks({ id, setStateAddTask }:TaskProps) {
    const [textInputTask, setTextInputTask] = useState<string>('')
    const [disableInputTask, setDisableInputTask] = useState<boolean>(false)
    const [stateLoadingPassword, setStateLoadingPassword] = useState<boolean>(false)

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schemaDefinitionTask)
    });

    useEffect(() => {
        toast.error(errors.task?.message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
        });
    }, [errors.task])

    useEffect(() => {
        setDisableInputTask(textInputTask == '')
    }, [textInputTask])

    useEffect(() => {}, [setStateAddTask])

    async function onSubmit({ task }: SubmitTaskProps) {
        try {
            setStateLoadingPassword(true)
            await CreateTask({
                id,
                description: task
            });
            setStateAddTask(true);
            setTextInputTask('')
        } catch(err: any) {
            toast.error(err.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
            setStateLoadingPassword(false)
        } finally {
            setStateLoadingPassword(false)
            toast.success("Registrado com sucesso!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
        }
    }

    return (
        <>
            <section className="-mt-6">
                <ContainerGrid>
                    <div>
                        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col md:flex-row gap-2">
                            <InputForm
                                type="text"
                                placeholder="Adicione uma nova tarefa"
                                className="flex-1"
                                registerYup={register("task")}
                                value={textInputTask}
                                onChange={content => {
                                    setTextInputTask(content.target.value)
                                }}
                            />
                            <InputForm
                                type="submit"
                                textButton="Enviar"
                                containsIcon
                                disabled={disableInputTask}
                                className={disableInputTask ? "hover:bg-blue-dark md:w-fit w-full" : "w-fit"}
                                stateLoadingPassword={stateLoadingPassword}
                            />
                        </form>
                    </div>
                </ContainerGrid>
            </section>
        </>
    )
}