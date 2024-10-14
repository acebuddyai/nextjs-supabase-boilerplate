/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = {
    env: {
      HUGGING_FACE_API_TOKEN: process.env.HUGGING_FACE_API_TOKEN,
    },
  };