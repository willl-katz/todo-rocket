"use server"
import {v4 as uuid} from 'uuid';
import { ConnectDb } from '@/lib/bd';
import fs from "fs";
import { ConnectSmtp } from '@/lib/smtp';
import dotenv from 'dotenv';
dotenv.config();

type SignInRequestData = {
    email: string,
    password: string
}

type RegisterData = {
    email: string,
    password: string,
    username: string,
    avatar_url?: string
    confirmEmail?: boolean
}

interface User {
    id: number;
    username: string;
    email: string;
    password?: string;
    token: string;
    avatar_url: string;
    confirm_email: boolean;
}

type UsersInformationProps = {
    userAuth: User | null,
    firstRegisterGoogle?: {
        email: string,
        password: string,
        registerFirstGoogle: boolean
    }
}

type UpdateUserProps = {
    id: number;
    username?: string;
    email?: string;
    password?: string;
    avatar_url?: string;
}

type DataImageProps = {
    data: {
        filename: string,
        httpfilepath: string
    }
}

type CreateImageLocalProps = {
    selectFile: File;
}

export async function initializeProgram() {
    const pool = ConnectDb()
    const client = await pool.connect();

    try {
        const queryVerifyTables = "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public');";
        const stateVerifyTable = await client.query(queryVerifyTables);
        if (!stateVerifyTable.rows[0].exists) {
            const queryCreateTableUsers = `
                CREATE TABLE users(
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(32) UNIQUE NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(100) NOT NULL,
                    avatar_url VARCHAR(300),
                    token VARCHAR(300) UNIQUE,
                    create_time TIMESTAMP NOT NULL,
                    confirm_email BOOLEAN DEFAULT FALSE NOT NULL
                );
            `;
            await client.query(queryCreateTableUsers);
            const queryCreateTableTasks = `
                CREATE TABLE tasks(
                    id SERIAL NOT NULL,
                    descricao varchar(300) NOT NULL,
                    concluido BOOLEAN DEFAULT FALSE NOT NULL,
                    create_time_tarefa TIMESTAMP NOT NULL,
                    id_user INT REFERENCES users(id) NOT NULL
                );
            `;
            await client.query(queryCreateTableTasks);
        } else {
            const queryImagesUsedUsers = "SELECT avatar_url FROM users;";
            const ImagesUsedUsers = await client.query(queryImagesUsedUsers);
            let listArquivesundefinedUser:any[] = [];
            ImagesUsedUsers.rows.map(obj => {
                let pathAvatar = obj.avatar_url.split('images/')[1];
                listArquivesundefinedUser.push(pathAvatar)
            })
            fs.readdir("./public/images", (err, files) => {
                let listArquivesundefinedUserfiltered:any[] = files.filter(u => {
                    return !listArquivesundefinedUser.includes(u);
                })
                listArquivesundefinedUserfiltered.map(file => {
                    fs.unlink(`./public/images/${file}`, async (err) => {
                        if (err) {
                            console.error("Ocorreu um erro ao tentar deletar o arquivo:", err);
                        }
                    });
                })
            })
        }
    } catch (error) {
        console.log('error', error);
        throw error; // relança o erro para ser tratado pelo chamador
    } finally {
        client.release();
        pool.end();
    }
}

async function insertTokenUser(id: number) {
    const pool = ConnectDb()
    let token = uuid();
    const client = await pool.connect();

    try {
        const queryTextUpdate = 'UPDATE users SET token = $1 WHERE id = $2;';
        const queryTextSelect = 'SELECT id, username, email, password, avatar_url, token, confirm_email FROM users WHERE id = $1;'
        await client.query(queryTextUpdate, [token, id]);
        const resSelect = await client.query(queryTextSelect, [id]);
        return resSelect.rows[0];
    } catch (e) {
        console.log('error', e);
        throw e; // relança o erro para ser tratado pelo chamador
    } finally {
        client.release();
        pool.end();
    }
}

export async function signInRequest(data: SignInRequestData) {
    const pool = ConnectDb()
    const users:User[] | any[] | void = await pool.connect().then(client => {
        return client.query("SELECT id, username, email, password, avatar_url, token, confirm_email FROM users").then(resolved => {
            return resolved.rows;
        }).catch(e => {
            console.log('error', e);
        }).finally(() => {
            client.release();
            pool.end();
        });
    })

    let stateVoid;
    if(users != null) {
        stateVoid = users.find(u => u.email === data.email && u.password === data.password);
    }
    const user:User = stateVoid

    if (!user) {
        try {
            // Alguma lógica que pode lançar um erro
            throw new Error('Email ou Senha Erradas');
        } catch (error:any) {
            // Lidar com o erro
            let mesageError:string = error.message
            return {
                userAuth: null
            } as UsersInformationProps;
        }
    } else {
        let applyTokenUser = await insertTokenUser(user.id)

        return {
            userAuth: applyTokenUser
        } as UsersInformationProps
    }
}

export async function signInRequestGoogle(data:{emailGoogle:string, pictureGoogle?:string, usernameGoogle?:string}) {
    const pool = ConnectDb()
    const users:User[] | any[] | void = await pool.connect().then(client => {
        return client.query("SELECT id, username, email, password, avatar_url, token, confirm_email FROM users").then(resolved => {
            return resolved.rows;
        }).catch(e => {
            console.log('error', e);
        }).finally(() => {
            client.release();
            pool.end();
        });
    })

    let stateVoid;
    if(users != null) {
        stateVoid = users.find(u => u.email === data.emailGoogle);
    }
    const user:User = stateVoid

    if (!user) {
        try {
            const nameTemp = "usuario-" + gerarCodigo().split("-")[0]
            await register({
                email: data.emailGoogle,
                password: nameTemp,
                username: nameTemp,
                avatar_url: data.pictureGoogle,
                confirmEmail: true
            })
            return {
                firstRegisterGoogle: {
                    registerFirstGoogle: true,
                    email: data.emailGoogle,
                    password: nameTemp,
                }
            } as UsersInformationProps;
        } catch (error:any) {
            // Lidar com o erro
            let mesageError:string = error.message
            return {
                userAuth: null
            } as UsersInformationProps;
        }
    } else {
        let applyTokenUser = await insertTokenUser(user.id)

        return {
            userAuth: applyTokenUser
        } as UsersInformationProps
    }
}

export async function recoverUserInformation(token : string) {
    const pool = ConnectDb()
    const users:User[] | any[] | void = await pool.connect().then(client => {
        return client.query("SELECT id, username, email, avatar_url, token FROM users WHERE token = $1", [token]).then(resolved => {
            return resolved.rows;
        }).catch(e => {
            console.log('error', e);
        }).finally(() => {
            client.release();
            pool.end();
        });
    })

    let stateVoid;
    if(users != null) {
        stateVoid = users.find(u => u.token === token);
    }
    const user = stateVoid;

    if (!user) {
        throw Error('Usuário não encontrado');
    }

    return {
        userAuth: user
    } as UsersInformationProps
}

export async function signOut(id:number | undefined) {
    const pool = ConnectDb()
    const client = await pool.connect();

    try {
        const queryTextUpdate = 'UPDATE users SET token = null WHERE id = $1;';
        await client.query(queryTextUpdate, [id]);
    } catch (e) {
        console.log('error', e);
        throw e; // relança o erro para ser tratado pelo chamador
    } finally {
        client.release();
        pool.end();
    }
}

export async function register(data: RegisterData) {
    const pool = ConnectDb()
    const client = await pool.connect();

    try {
        const { email, password, username, avatar_url, confirmEmail } = data;
        const queryInsertUser = "INSERT INTO users (username, email, password, avatar_url, confirm_email, create_time) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP);";
        await client.query(queryInsertUser, [username, email, password, avatar_url, confirmEmail]);
    } catch (e) {
        console.log('error', e);
        throw e; // relança o erro para ser tratado pelo chamador
    } finally {
        client.release();
        pool.end();
    }
}

export async function updateProfile({username, email, password, avatar_url, id}:UpdateUserProps) {
    const pool = ConnectDb()
    const client = await pool.connect();

    try {
        if (avatar_url) {
            const queryVerifyAvatarUpdate = 'SELECT avatar_url FROM users WHERE id = $1'
            let atualyAvatar = await client.query(queryVerifyAvatarUpdate, [id]);

            if(atualyAvatar.rows[0].avatar_url !== avatar_url) {
                if(atualyAvatar.rows[0].avatar_url == null ) {
                    let queryImageUpdate = 'UPDATE users SET avatar_url = $2 WHERE id = $1;';
                    await client.query(queryImageUpdate, [id, avatar_url]);
                } else {
                    let pathAvatarAtualy = "./public" + atualyAvatar.rows[0].avatar_url.split('3000')[1]
                    if(fs.existsSync(pathAvatarAtualy)) {
                        fs.unlink(pathAvatarAtualy, async (err) => {
                            if (err) {
                                console.error("Ocorreu um erro ao tentar deletar o arquivo:", err);
                            } else {
                                console.log("Arquivo deletado com sucesso!");
                            }
                        });
                    } else {
                        console.log("Arquivo não encontrado");
                    }
                    let queryImageUpdate = 'UPDATE users SET avatar_url = $2 WHERE id = $1;';
                    await client.query(queryImageUpdate, [id, avatar_url]);
                }
            }
        } if(username) {
            const queryVerifyUserUpdate = 'SELECT username FROM users WHERE id = $1'
            let atualyUser= await client.query(queryVerifyUserUpdate, [id]);
            if(atualyUser.rows[0] !== username) {
                const queryUsernameUpdate = 'UPDATE users SET username = $2 WHERE id = $1;';
                await client.query(queryUsernameUpdate, [id, username]);
            }
        } if (email) {
            const queryVerifyEmailUpdate = 'SELECT email FROM users WHERE id = $1'
            let atualyEmail = await client.query(queryVerifyEmailUpdate, [id]);
            if(atualyEmail.rows[0] !== email) {
                const queryEmailUpdate = 'UPDATE users SET email = $2, confirm_email = false  WHERE id = $1;';
                await client.query(queryEmailUpdate, [id, email]).catch(err => {throw new Error("Já existe uma conta com esse email");
                });
            }
        }
        if (password) {
            const queryVerifyPasswordUpdate = 'SELECT password FROM users WHERE id = $1'
            let atualyPassword = await client.query(queryVerifyPasswordUpdate, [id]);
            if(atualyPassword.rows[0] !== password) {
                const queryPasswordUpdate = 'UPDATE users SET password = $2 WHERE id = $1;';
                await client.query(queryPasswordUpdate, [id, password]);
            }
        }
    } catch (e) {
        console.log('error', e);
        throw e; // relança o erro para ser tratado pelo chamador
    } finally {
        client.release();
        pool.end();
    }
}

function gerarCodigo() {
    let letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let numeros = '0123456789';
    let codigo = '';
    for (var i = 0; i < 4; i++) {
        codigo += numeros[Math.floor(Math.random() * numeros.length)];
    }
    codigo += '-';
    for (var i = 0; i < 4; i++) {
        codigo += letras[Math.floor(Math.random() * letras.length)];
    }
    return codigo;
}

export async function sendCodeConfirmEmail({ userEmail }:{userEmail:string}) {
    let transporter = await ConnectSmtp();
    const codeRadom = gerarCodigo();

    try {
        if(codeRadom == undefined) throw new Error("Código não definido no servidor")
        transporter.sendMail({
            from: process.env.EMAIL_USER, // sender address
            to: userEmail, // list of receivers
            subject: `Confirmação de email do site TODO`, // Subject line
            text: `
                -- Código de verificação de email --
                Copie e cole no campo de confirmação esse código para verificar seu email
                Código: ${codeRadom}
            `, // plain text body
        }, (error:any, info) => {
            if(error) {
                throw new Error("Erro no envio do email | " + error.message)
            }
        })
        return codeRadom;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function confirmEmail({ tokenEmail, tokenEmailForm, id }:{tokenEmail:string, tokenEmailForm:string, id:number}) {
    const pool = ConnectDb()
    const client = await pool.connect();

    try {
        if(tokenEmail === tokenEmailForm) {
            const queryUpdateStateConfirmEmail = 'UPDATE users SET confirm_email = true WHERE id = $1';
            await client.query(queryUpdateStateConfirmEmail, [id])
        } else {
            throw new Error("Token de confirmação inválido!")
        }
    } catch (err) {
        console.error(err);
        throw err
    } finally {
        client.release();
        pool.end();
    }
}

export async function verifyEmailExists(email: string) {
    const pool = ConnectDb()
    const client = await pool.connect();

    try {
        const querySelectpdateVerifyEmailExists = 'SELECT email, id FROM users WHERE email = $1';
        let existEmail = await client.query(querySelectpdateVerifyEmailExists, [email])
        return existEmail.rows
    } catch (err) {
        console.error(err);
        throw err;
    }  finally {
        client.release();
        pool.end();
    }
}

export async function changePassword({ tempId, newPassword }:{ tempId:number, newPassword:string }) {
    const pool = ConnectDb()
    const client = await pool.connect();

    try {
        const querySelectpdateVerifyEmailExists = 'UPDATE users SET password = $2 WHERE id = $1';
        await client.query(querySelectpdateVerifyEmailExists, [tempId, newPassword])
    } catch (err) {
        console.error(err);
        throw err;
    }  finally {
        client.release();
        pool.end();
    }
}