import S3 from "aws-sdk/clients/s3"


export type GetPresignedUrlParams = {
    Bucket: string;
    Key: string;
    Expires: number;
}


export type GetSignedUrls = {
    url: string;
    title: string;
}

export interface IS3Library {
    listObjects: (params:S3.Types.ListObjectsV2Request) => Promise<S3.Types.ListObjectsV2Output>
    getObject: (item:S3.GetObjectRequest) => Promise<S3.Types.GetObjectOutput>
    getSignedUrls: (params:S3.Types.ListObjectsV2Request) => Promise<GetSignedUrls[]>
}



const s3Library = (S3Instance:S3) => {


    const getObjectKeys  = async (params:S3.Types.ListObjectsV2Request):Promise<string[]> => {
        // const params = { Bucket: bucketName, Prefix: 'path/to/your/mp3/' };
        const data = await S3Instance.listObjectsV2(params).promise();
        if(data.Contents)
            return data.Contents.filter(item => item.Key !== undefined).map(item => item.Key as string);
        return []
        
    }

    const generatePresignedUrl = async (params:GetPresignedUrlParams ) => {
       return S3Instance.getSignedUrl('getObject', params);
    }

   const getSignedUrls = async (params:S3.Types.ListObjectsV2Request): Promise<GetSignedUrls[]> => {
        const keys = await getObjectKeys(params);
        if(!keys) return []
        const p = await Promise.all(
            keys.map(async Key => {
                return {
                    url: await generatePresignedUrl({...params, Expires: 60, Key}),
                    title: Key
                }
                 
            })
        )
        return p;
    }

    const listObjects = async (params:S3.Types.ListObjectsV2Request):Promise<S3.Types.ListObjectsV2Output> => {
       const getObjectsPromise:Promise<S3.Types.ListObjectsV2Output> = new Promise((resolve, reject) => {
            S3Instance.listObjectsV2(params, function(err:Error, data:S3.Types.ListObjectsV2Output) {
                if(err) {
                    reject(err)
                }
                resolve(data)
            });
        }) 

        return getObjectsPromise
    }

    const getObject = async (item:S3.GetObjectRequest):Promise<S3.Types.GetObjectOutput> => {
        const getObjectPromise:Promise<S3.Types.GetObjectOutput> = new Promise((resolve, reject) => {
            S3Instance.getObject(item, function(err:Error, data:S3.Types.GetObjectOutput) {
                if(err) 
                    reject(err)
                
                resolve(data)
            });
        }) 

        return getObjectPromise
    }

   
    return {
        listObjects,
        getObject,
        getSignedUrls
    }
}

export const createS3Lib = (S3Instance:S3) => {
    return s3Library(S3Instance)
}