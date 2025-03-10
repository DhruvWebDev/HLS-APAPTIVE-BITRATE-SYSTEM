#!/bin/bash

# Input file
# Output directory for HLS files
OUTPUT_DIR="hls_output"
# Output filename pattern
OUTPUT_NAME="stream"
# AWS S3 bucket name

#   First configure aws credentials
aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
aws configure set default.region $AWS_DEFAULT_REGION

# Create output directory
mkdir -p $OUTPUT_DIR

# Download video file from s3 bucket
aws s3 cp s3://$S3_BUCKET_NAME/$INPUT_FILE $INPUT_FILE
# FFmpeg command for HLS with multiple resolutions
ffmpeg -i $INPUT_FILE \
  -filter_complex \
  "[0:v]split=4[v1][v2][v3][v4]; \
   [v1]scale=w=1920:h=1080:force_original_aspect_ratio=decrease[v1out]; \
   [v2]scale=w=1280:h=720:force_original_aspect_ratio=decrease[v2out]; \
   [v3]scale=w=854:h=480:force_original_aspect_ratio=decrease[v3out]; \
   [v4]scale=w=640:h=360:force_original_aspect_ratio=decrease[v4out]" \
  -map "[v1out]" -c:v:0 libx264 -b:v:0 5000k -maxrate:v:0 5500k -bufsize:v:0 7000k \
  -map "[v2out]" -c:v:1 libx264 -b:v:1 3000k -maxrate:v:1 3300k -bufsize:v:1 4500k \
  -map "[v3out]" -c:v:2 libx264 -b:v:2 1500k -maxrate:v:2 1650k -bufsize:v:2 2250k \
  -map "[v4out]" -c:v:3 libx264 -b:v:3 800k -maxrate:v:3 880k -bufsize:v:3 1200k \
  -map a:0 -c:a aac -b:a:0 192k -ac 2 \
  -map a:0 -c:a aac -b:a:1 128k -ac 2 \
  -map a:0 -c:a aac -b:a:2 96k -ac 2 \
  -map a:0 -c:a aac -b:a:3 64k -ac 2 \
  -var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2 v:3,a:3" \
  -preset medium -crf 23 -g 60 -sc_threshold 0 \
  -keyint_min 60 -hls_time 6 -hls_playlist_type vod \
  -hls_segment_filename "$OUTPUT_DIR/${OUTPUT_NAME}_%v_%03d.ts" \
  -master_pl_name "master.m3u8" \
  "$OUTPUT_DIR/${OUTPUT_NAME}_%v.m3u8"


#   Upload the output to the s3 bucket 
aws s3 cp $OUTPUT_DIR s3://$S3_BUCKET_NAME/ --recursive