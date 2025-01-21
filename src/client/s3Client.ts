import S3 from "aws-sdk/clients/s3"


export interface IS3Library {
    listObjects: (params:S3.Types.ListObjectsV2Request) => Promise<S3.Types.ListObjectsV2Output>
    getObject: (item:S3.GetObjectRequest) => Promise<S3.Types.GetObjectOutput>
}



const s3Library = (S3Instance:S3) => {

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
        getObject
    }
}

export const createS3Lib = (S3Instance:S3) => {
    return s3Library(S3Instance)
}