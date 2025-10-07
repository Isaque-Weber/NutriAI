import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../../../@config/envs/env.config';
import { log } from '../../logging/logger';

export enum BucketFolder {
  AVATARS = 'avatars',
  IMAGES = 'images',
  VIDEOS = 'videos',
}

@Injectable()
export class GoogleCloudStorageService {
  private storage: Storage;
  private readonly bucketName: string;

  constructor() {
    this.storage = new Storage({
      projectId: env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key:
          '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDgvLBvt+Pzl0HN\nxthx9bi9HR4P8zq29u7E6Am4GAqrHT4SOgKvsYw4tCR2onDmHbZrQG6bu1qGI7V7\nfpnd9WeaAFN40BU7Gvjj18YPY7EuqWB2mDEmUY/p9RoXiTi7xARpeda4uSUloQRM\neAlDiSmZOWAO45vGwxpnuiuZX5U2LczQWdV2MyAlXQVDuiuCrbDYzQP+OiWJbS4z\nB0AiT69VR5OLmSM/IhVGDwFzoa9+2FJwYp98iDIbsD32tbZ9KffgrSlvUYkg0L0r\n6ubDCo0PfQTHEVix996oL8jnAM3KXmdLZuuvYrLW6yijkGrB+PW160N/SvNsdVoH\nGrIwBx5XAgMBAAECggEAQ1xbOAky0pL+PssAmlvP9SMynQ5HBYtLMwrnyt2t6O8Z\naUYpAvdhM6fPHB4BX//86vXDkXsdHYK7hVoDjZNea7r4Sgh4rKAfhM9qhrdXZsiO\n6M0iQj2FONdl7DMNpb4RonnKAdFA0KAMFU2PXUZSCSK4542SZgeZtQiIw+5x32xY\nIex8Be5Hvwp9uxEGB34WYa4RtbcRC2XO2jCgYFXLEakgIzVW2WEff++8FFIV5vuI\nHEICsWS0bND+meDr4NVtLA+z+1OMZTCtab5LvBsM6jb9CJZXN9dokkK9w9MbZTLe\ng3dZyGLKCjX5bJUujKYbSokBWVH+ZLm/8H6edPHXdQKBgQDxr/1KuCdTJIDHwyc0\nf1fjV3xCB2gxJH8YUKg8AkFiqVvAB9MzRzk91LT2lj6pYbbiIEpmWl/WMgvUbDcG\nhoJaAZsVrwzl4vryCmSNSeEBfYhBtqEN8EtEEjmLi2m7W1UHNHelrAgJiuVy4/oQ\ncGQ8nlHZ9akV99iWmneYKXKAjQKBgQDuC7rWfmRzYe9Q5MAELOnHl2znATdgCqGR\n0KDBto6i5n+01RT/QJ+lsPJAxALCBOXd6tGsZ8cMmQnbVY0FAKCDldtVnAFeWYV0\nWz386aPuZ1XRGVkNK4cGvsMOE2LmnXr0okcdTbqCIoimdfQUUwuIY30vkNJXqb5B\nFcutqUqbcwKBgHhygaP8NLTtyzRC4MX79Lv6/JUXheh/zMs8XytQ4G8gAfaor6ut\ngix7VhhR9jaJ2Q/Gke2CeqKP3G9n4uBgppPemwBqdd4XiYKYhVYYjIcmnYJKVudQ\nauIoxv7xYqcZtD1b+4jYPEUtMH5aeWQ57up66EXcdQDavNkJcDKn7UV9AoGAYzQg\nOSOTWUKHKX8rRpIxGyzQBbVMDopfqxT26cPazaihsArdJUMZRUPosXT+cTz5TvJ9\nTwwwt99PbEjK7DrGqg/ZyGOrblaAd21O+AemecQ2z11w7zwkmXsGbudFYDZg93Jp\nkJzEDVe2+yhM/+tb8wsDML956W6kCxu6NjVHEmECgYBB7uDHiPghtooVxUzL9/Y2\n6mSZImByvslqAdZ+c6ToWerA2W9b3RahSM9YZODhWDg9d+yjL8PUv55UYYEj6PHG\nym9mc/YFFCBSPandaMrbylZdXwYtsvRTyC2707C5a62OVv/LPrhOoW2RQudHyN6d\nPGlDAdnXM0ERlT2ea0NuWw==\n-----END PRIVATE KEY-----\n',
      },
    });
    this.bucketName = env.GOOGLE_CLOUD_STORAGE_BUCKET;
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: BucketFolder,
  ): Promise<string> {
    const targetBucket = this.bucketName;
    const fileName = `${folder}/${uuidv4()}-${file.originalname}`;
    const bucket = this.storage.bucket(targetBucket);
    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
      public: true,
      validation: 'md5',
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        reject(error);
      });

      stream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${targetBucket}/${fileName}`;
        resolve(publicUrl);
      });

      stream.end(file.buffer);
    });
  }

  async uploadFileFromBuffer(
    buffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<string> {
    const targetBucket = this.bucketName;
    const bucket = this.storage.bucket(targetBucket);
    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: mimeType,
      },
      public: true,
      validation: 'md5',
    });

    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        reject(error);
      });

      stream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${targetBucket}/${fileName}`;
        resolve(publicUrl);
      });

      stream.end(buffer);
    });
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const targetBucket = this.bucketName;
      // Extract filename from URL
      const fileName = fileUrl.split(`${targetBucket}/`)[1];
      if (!fileName) {
        throw new Error('Invalid file URL');
      }

      const bucket = this.storage.bucket(targetBucket);
      const file = bucket.file(fileName);

      await file.delete();
    } catch (error) {
      log.error(
        `Error deleting file from Google Cloud Storage: ${error.message}`,
      );
    }
  }

  async fileExists(fileUrl: string): Promise<boolean> {
    try {
      const targetBucket = this.bucketName;
      const fileName = fileUrl.split(`${targetBucket}/`)[1];
      if (!fileName) {
        return false;
      }

      const bucket = this.storage.bucket(targetBucket);
      const file = bucket.file(fileName);
      const [exists] = await file.exists();

      return exists;
    } catch (error) {
      return false;
    }
  }

  validateImageFile(file: Express.Multer.File): boolean {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    return allowedMimeTypes.includes(file.mimetype) && file.size <= maxSize;
  }
}
