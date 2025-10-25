import express from 'express';
import { generateSignedUrl } from '../OssUploader.js';

/**
 * 处理私有 Bucket 访问
 */
export async function handlePrivateBucketAccess(
  res: express.Response,
  osspath: string
): Promise<void> {
  try {
    if (res.headersSent) {
      console.log('响应已发送，跳过私有Bucket访问处理');
      return;
    }

    console.log('尝试为私有OSS对象生成签名URL...');

    let objectKey = osspath;
    if (objectKey.startsWith('http')) {
      try {
        const url = new URL(objectKey);
        objectKey = url.pathname.substring(1);
      } catch (error) {
        console.error('解析OSS URL失败:', error);
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Internal Server Error',
            message: '文件路径格式错误'
          });
        }
        return;
      }
    }

    // 生成24小时有效期的签名URL
    const signedUrl = await generateSignedUrl(objectKey, 86400);
    console.log('签名URL生成成功，代理获取内容:', signedUrl);

    if (osspath.includes('.html')) {
      await proxyOSSContent(res, signedUrl, 'text/html; charset=utf-8');
    } else {
      if (!res.headersSent) {
        res.redirect(302, signedUrl);
      }
    }
  } catch (error) {
    console.error('生成签名URL失败:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Access Denied',
        message: '文件访问被拒绝，且无法生成授权访问链接。请检查OSS配置。'
      });
    }
  }
}

/**
 * 代理获取OSS内容并返回，设置正确的响应头
 */
export async function proxyOSSContent(
  res: express.Response,
  signedUrl: string,
  contentType: string
): Promise<void> {
  try {
    if (res.headersSent) {
      console.log('响应已发送，跳过代理内容获取');
      return;
    }

    const https = await import('https');
    const http = await import('http');

    const url = new URL(signedUrl);
    const client = url.protocol === 'https:' ? https : http;

    console.log(`代理获取OSS内容: ${signedUrl}`);

    let content = '';
    let hasResponded = false;

    const proxyReq = client.get(signedUrl, (proxyRes) => {
      console.log(`签名URL响应状态码: ${proxyRes.statusCode}`);

      if (proxyRes.statusCode === 200) {
        proxyRes.on('data', (chunk) => {
          content += chunk.toString();
        });

        proxyRes.on('end', () => {
          if (!hasResponded && !res.headersSent) {
            console.log('通过签名URL获取内容完成，返回给用户');
            hasResponded = true;

            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', 'inline; filename="visualization.html"');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.removeHeader('x-oss-force-download');
            res.status(200).send(content);
          }
        });
      } else {
        if (!hasResponded && !res.headersSent) {
          console.error(`签名URL访问失败，状态码: ${proxyRes.statusCode}`);
          hasResponded = true;
          res.status(500).json({
            error: 'Internal Server Error',
            message: '无法获取文件内容'
          });
        }
      }
    });

    proxyReq.on('error', (error) => {
      if (!hasResponded && !res.headersSent) {
        console.error('代理获取OSS内容失败:', error);
        hasResponded = true;
        res.status(500).json({
          error: 'Internal Server Error',
          message: '文件访问失败'
        });
      }
    });

    proxyReq.setTimeout(10000, () => {
      if (!hasResponded && !res.headersSent) {
        console.error('代理获取OSS内容超时');
        hasResponded = true;
        proxyReq.destroy();
        res.status(500).json({
          error: 'Internal Server Error',
          message: '文件访问超时'
        });
      }
    });

    proxyReq.end();
  } catch (error) {
    console.error('代理获取OSS内容失败:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: '文件访问失败'
      });
    }
  }
}
