import { cloudConfig } from "./cloudinary.js";

// uploadSingleFile
export const uploadSingleFile = async ({
  fileLocation,
  storagePathOnCloudinary,
}) => {
  const { public_id, secure_url } = await cloudConfig().uploader.upload(
    fileLocation,
    {
      folder: `${process.env.APP_NAME}/${storagePathOnCloudinary}`,
    }
  );

  //* If you used returned secure_url will not work, you have to modify it to be sutiable for browsers
  return { public_id, secure_url };
};

// uploadManyFiles
export const uploadManyFiles = async ({
  fileLocation = [],
  storagePathOnCloudinary,
}) => {
  let images = [];
  for (const item of fileLocation) {
    const { public_id, secure_url } = await uploadSingleFile({
      fileLocation: item,
      storagePathOnCloudinary,
    });
    images.push({ public_id, secure_url });
  }
  return images;
};

// destroySingleFile
export const destroySingleFile = async ({ public_id }) => {
  await cloudConfig().uploader.destroy(public_id);
};

// deleteManyFiles
export const destroyManyFiles = async ({ public_ids = [] }) => {
  await cloudConfig().api.delete_resources(public_ids);
};

// deleteByPrefix
export const deleteByPrefix = async ({ storagePathOnCloudinary = "" }) => {
  await cloudConfig().api.delete_resources_by_prefix(
    `${process.env.APP_NAME}/${storagePathOnCloudinary}`
  );
};
// deleteFolder
export const deleteFolder = async ({ storagePathOnCloudinary = "" }) => {
  await cloudConfig().api.delete_folder(
    `${process.env.APP_NAME}/${storagePathOnCloudinary}`
  );
};
