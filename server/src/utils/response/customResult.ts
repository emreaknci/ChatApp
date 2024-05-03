export interface IResult<T> {
    data?: T ;
    success?: boolean;
    message?: string;
}

export const Result = (result: IResult<any>) => {
    return {
        success: result.success,
        message: result.message,
        data: result.data
    }
}