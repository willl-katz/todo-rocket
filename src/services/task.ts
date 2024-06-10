"use server"
import { ConnectDb } from '@/lib/bd';

type CreateTaskProps = {
    id: number;
    description: string;
}

type GetTaskProps = {
    id: number;
}

type ListTasksUserProps = [
    {
        id: number;
        descricao: string;
        concluido: boolean;
    }
]

type UpdateTaskConcludedProps = {
    taskConcluded: boolean;
    id_task: number;
    id_user: number;
}

type TotalCompletedProps = {
    count: string;
}


export async function CreateTask({id, description}:CreateTaskProps) {
    const pool = ConnectDb()
    const client = await pool.connect();

    try {
        const queryInsertTask = 'INSERT INTO tasks (descricao, create_time_tarefa, id_user) VALUES ($1, CURRENT_TIMESTAMP, $2); ';
        await client.query(queryInsertTask, [description, id]);
    } catch (e) {
        console.log('error', e);
        throw e; // relança o erro para ser tratado pelo chamador
    } finally {
        client.release();
        pool.end();
    }
}

export async function GetTasks({ id }:GetTaskProps) {
    const pool = ConnectDb()
    const client = await pool.connect();

    try {
        const querySelectTask = 'SELECT tasks.id, tasks.descricao, tasks.concluido FROM tasks, users WHERE tasks.id_user = $1 ORDER BY tasks.id;';
        const listTasks = await client.query(querySelectTask, [id]);
        const arrayListTasks = listTasks.rows; // Não é necessário criar um novo array aqui
        let arrayMold = Object.create(null);
        let ArrayFiltrateListTasks = arrayListTasks.filter(function (a) {
            return !arrayMold[JSON.stringify(a)] && (arrayMold[JSON.stringify(a)] = true);
        })
        if (ArrayFiltrateListTasks.length != 0) {
            JSON.stringify([])
            return JSON.stringify(ArrayFiltrateListTasks as ListTasksUserProps); // Retorne o array completo
        } else {
            return JSON.stringify([]);
        }
    } catch (e) {
        console.log('error', e);
        throw e; // Relança o erro para ser tratado pelo chamador
    } finally {
        client.release();
    }
}

export async function UpdateTaskConcluded({ taskConcluded, id_task, id_user }:UpdateTaskConcludedProps) {
    const pool = ConnectDb()
    const client = await pool.connect();

    try {
        const queryTextUpdate = 'UPDATE tasks SET concluido = $1 WHERE tasks.id_user = $2 AND tasks.id = $3;';
        await client.query(queryTextUpdate, [taskConcluded, id_user, id_task]);
    } catch (e) {
        console.log('error', e);
        throw e; // relança o erro para ser tratado pelo chamador
    } finally {
        client.release();
        pool.end();
    }
}

export async function DeleteTask(id_task:number) {
    const pool = ConnectDb()
    const client = await pool.connect();

    try {
        const queryInsertTask = 'DELETE FROM tasks WHERE id = $1;';
        await client.query(queryInsertTask, [id_task]);
    } catch (e) {
        console.log('error', e);
        throw e; // relança o erro para ser tratado pelo chamador
    } finally {
        client.release();
        pool.end();
    }
}

export async function TotalCompleted(id_user:number) {
    const pool = ConnectDb()
    const client = await pool.connect();

    try {
        const queryInsertTask = 'SELECT COUNT(concluido) FROM tasks WHERE id_user = $1 AND concluido = true;';
        let valueTotalCompleted = await client.query(queryInsertTask, [id_user]);
        return JSON.parse(JSON.stringify(valueTotalCompleted.rows[0])) as TotalCompletedProps
    } catch (e) {
        console.log('error', e);
        throw e; // relança o erro para ser tratado pelo chamador
    } finally {
        client.release();
        pool.end();
    }
}