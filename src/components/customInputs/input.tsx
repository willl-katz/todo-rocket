import Image from 'next/image';
import React, { InputHTMLAttributes, useEffect, useState } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';
import IconPlus from '@/assets/plus.svg';
import IconEyeOpen from '@/assets/eye-open.svg';
import IconEyeClose from '@/assets/eye-closed.svg';

interface InputFormProps extends InputHTMLAttributes<HTMLInputElement>  {
    type: React.HTMLInputTypeAttribute;
    registerYup?: UseFormRegisterReturn;
    errors?: string;
    className?: string;
    containsIcon?: boolean;
    srcIcon?: string;
    textButton?: string;
    stateLoadingPassword?: boolean;
}

export function InputForm({type, className, containsIcon = false, srcIcon = IconPlus, registerYup, errors = '', textButton, stateLoadingPassword, ...rest}: InputFormProps) {
    const [stateViewPassword, setStateViewPassword] = useState<boolean>(false)

    const defaultClassInput = (errors) ? 'border border-solid border-danger ' + 'w-full px-4 py-2 placeholder:text-gray-300 bg-gray-500 focus:outline-0 focus:border focus:border-purple border border-transparent transition' : '' + 'w-full px-4 py-2 placeholder:text-gray-300 bg-gray-500 focus:outline-0 focus:border focus:border-purple border border-transparent transition';
    const defaultClassButton = 'px-4 py-2 placeholder:text-white bg-blue-dark flex gap-2 items-center justify-center hover:bg-blue-hover transition relative w-full'
    const defaultClassSubButton = 'px-4 py-2 placeholder:text-gray-200 bg-transparent flex gap-2 items-center justify-center hover:bg-blue-hover transition relative border border-gray-200 hover:border-blue-hover w-full'
    const defaultClassPassword = (errors) ? 'border border-solid border-danger' + ' w-full px-4 py-2 placeholder:text-gray-300 bg-gray-500 focus:outline-0 focus:border focus:border-purple border border-transparent transition' : '' + 'w-full px-4 py-2 placeholder:text-gray-300 bg-gray-500 focus:outline-0 focus:border focus:border-purple border border-transparent transition';

    const combinedClassInput = twMerge(defaultClassInput, className)
    const combinedClassButton = twMerge(defaultClassButton, className)
    const combinedClassSubButton = twMerge(defaultClassSubButton, className)
    const combinedClassPassword = twMerge(defaultClassPassword, className)

    useEffect(() => {

    }, [stateViewPassword])

    return (
        <>
            {
                type != 'submit' && type != 'password' && type != 'button' &&
                <input
                    type={type}
                    className={combinedClassInput}
                    {...registerYup}
                    {...rest}
                />
            }
            {
                type == 'password' &&
                <div className={'relative'}>
                    <input
                        type={!stateViewPassword ? type : 'text'}
                        className={combinedClassPassword}
                        {...registerYup}
                        {...rest}
                    />
                    <button type='button' onClick={({target}) => {
                        !stateViewPassword ? setStateViewPassword(true) : setStateViewPassword(false)
                    }} className='absolute right-4 top-2/4 -translate-y-1/2'>
                        {
                            stateViewPassword ?
                            <Image
                                src={IconEyeOpen}
                                alt="Icone ver a senha"
                            /> :
                            <Image
                                src={IconEyeClose}
                                alt="Icone não ver a senha"
                            />
                        }
                    </button>
                </div>
            }
            {
                type == 'submit' && (
                    <div className={combinedClassButton}>
                        <input
                            type={type}
                            className='absolute top-0 right-0 w-full h-full cursor-pointer disabled:cursor-not-allowed'
                            name='acao'
                            value=''
                            {...rest}
                        />
                        <p className='w-auto text-center font-semibold'>{textButton}</p>
                        {
                            containsIcon && !stateLoadingPassword && <Image src={srcIcon} alt='Icone do botão' className='pt-0.5'/>
                        }
                        {
                            stateLoadingPassword &&
                            <div className="flex flex-row gap-2 w-auto mt-1">
                                <div className="w-2 h-2 rounded-full bg-gray-200 animate-bounce"></div>
                                <div className="w-2 h-2 rounded-full bg-gray-200 animate-bounce [animation-delay:-.3s]"></div>
                                <div className="w-2 h-2 rounded-full bg-gray-200 animate-bounce [animation-delay:-.5s]"></div>
                            </div>
                        }
                    </div>
                )
            }
            {
                type == 'button' && (
                    <div className={combinedClassSubButton}>
                        <input
                            type={type}
                            className='absolute top-0 right-0 w-full h-full cursor-pointer disabled:cursor-not-allowed'
                            name='acao'
                            value=''
                            {...rest}
                        />
                        <p className='w-auto text-center font-semibold'>{textButton}</p>
                        {
                            containsIcon && !stateLoadingPassword && <Image src={srcIcon} alt='Icone do botão' className='pt-0.5'/>
                        }
                        {
                            stateLoadingPassword &&
                            <div className="flex flex-row gap-2 w-auto mt-1">
                                <div className="w-2 h-2 rounded-full bg-gray-200 animate-bounce"></div>
                                <div className="w-2 h-2 rounded-full bg-gray-200 animate-bounce [animation-delay:-.3s]"></div>
                                <div className="w-2 h-2 rounded-full bg-gray-200 animate-bounce [animation-delay:-.5s]"></div>
                            </div>
                        }
                    </div>
                )
            }
        </>
    );
}
