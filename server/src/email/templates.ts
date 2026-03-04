export const verifyEmailTemplate = (
  name: string,
  url: string,
  password?: string,
) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>Verify Your Email</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }

          .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8fafc;
            padding: 40px 0;
          }

          .container {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            margin: 0 auto;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 40px 20px;
            text-align: center;
          }

          .logo {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.025em;
            text-decoration: none;
          }

          .content {
            padding: 40px;
            color: #1e293b;
          }

          .title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #0f172a;
          }

          .text {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
            color: #475569;
          }

          .cta-box {
            text-align: center;
            margin: 40px 0;
          }

          .button {
            display: inline-block;
            padding: 16px 36px;
            background-color: #4f46e5;
            color: #ffffff !important;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 12px;
            transition: background-color 0.2s;
            box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
          }

          .expiry-text {
            font-size: 14px;
            color: #94a3b8;
            text-align: center;
            margin-top: 16px;
          }

          .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 32px 0;
          }

          .footer {
            padding: 0 40px 40px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
          }

          .footer-links {
            margin-bottom: 16px;
          }

          .footer-link {
            color: #4f46e5;
            text-decoration: none;
            margin: 0 8px;
          }

          .raw-link {
            word-break: break-all;
            color: #4f46e5;
            text-decoration: underline;
          }

          @media only screen and (max-width: 640px) {
            .container {
              border-radius: 0;
            }
            .content {
              padding: 30px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <span class="logo">BCC007Team</span>
            </div>
            <div class="content">
              <h1 class="title">Confirm Your Email</h1>
              <p class="text">Hello ${name},</p>
              <p class="text">
                Welcome to BCC007Team! We're excited to have you on board. To get started and unlock full access to your account, please confirm your email address by clicking the button below.
              </p>
              ${password ? `<p class="text">Your password is ${password}</p>` : ""}
              ${password ? `<p class="text">It is important that you change your password after your first login to keep your account secure</p>` : ""}
              <div class="cta-box">
                <a href="${url}" class="button" target="_blank" rel="noopener noreferrer">Verify Email Address</a>
                <p class="expiry-text">This link will expire in 60 minutes.</p>
              </div>

              <div class="divider"></div>
              
              <p class="text" style="font-size: 14px;">
                If you're having trouble clicking the button, copy and paste this link into your browser:
                <br />
                <a href="${url}" class="raw-link">${url}</a>
              </p>
              
              <p class="text" style="font-size: 14px; margin-top: 24px;">
                If you didn't create an account with us, you can safely ignore this email.
              </p>
            </div>
            <div class="footer">
              <div class="footer-links">
                <a href="#" class="footer-link">Support</a>
                <a href="#" class="footer-link">Privacy Policy</a>
                <a href="#" class="footer-link">Terms of Service</a>
              </div>
              <p>© ${new Date().getFullYear()} BCC007Team. All rights reserved.</p>
              <p>Lagos, Nigeria</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
export const welcomePasswordTemplate = (name: string, password?: string) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>Your login password</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }

          .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8fafc;
            padding: 40px 0;
          }

          .container {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            margin: 0 auto;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 40px 20px;
            text-align: center;
          }

          .logo {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.025em;
            text-decoration: none;
          }

          .content {
            padding: 40px;
            color: #1e293b;
          }

          .title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #0f172a;
          }

          .text {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
            color: #475569;
          }

          .cta-box {
            text-align: center;
            margin: 40px 0;
          }

          .button {
            display: inline-block;
            padding: 16px 36px;
            background-color: #4f46e5;
            color: #ffffff !important;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 12px;
            transition: background-color 0.2s;
            box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
          }

          .expiry-text {
            font-size: 14px;
            color: #94a3b8;
            text-align: center;
            margin-top: 16px;
          }

          .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 32px 0;
          }

          .footer {
            padding: 0 40px 40px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
          }

          .footer-links {
            margin-bottom: 16px;
          }

          .footer-link {
            color: #4f46e5;
            text-decoration: none;
            margin: 0 8px;
          }

          .raw-link {
            word-break: break-all;
            color: #4f46e5;
            text-decoration: underline;
          }

          @media only screen and (max-width: 640px) {
            .container {
              border-radius: 0;
            }
            .content {
              padding: 30px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <span class="logo">BCC007Team</span>
            </div>
            <div class="content">
              <h1 class="title">Your login password</h1>
              <p class="text">Hello ${name},</p>
              <p class="text">
                Your password is ${password}
              </p>
              <p class="text">It is important that you change your password after your first login to keep your account secure</p>
              <div class="divider"></div>
            </div>
            <div class="footer">
              <div class="footer-links">
                <a href="#" class="footer-link">Support</a>
                <a href="#" class="footer-link">Privacy Policy</a>
                <a href="#" class="footer-link">Terms of Service</a>
              </div>
              <p>© ${new Date().getFullYear()} BCC007Team. All rights reserved.</p>
              <p>Lagos, Nigeria</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
export const forgotPasswordTemplate = (name: string, url: string) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>Forgot Password</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }

          .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8fafc;
            padding: 40px 0;
          }

          .container {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            margin: 0 auto;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 40px 20px;
            text-align: center;
          }

          .logo {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.025em;
            text-decoration: none;
          }

          .content {
            padding: 40px;
            color: #1e293b;
          }

          .title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #0f172a;
          }

          .text {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
            color: #475569;
          }

          .cta-box {
            text-align: center;
            margin: 40px 0;
          }

          .button {
            display: inline-block;
            padding: 16px 36px;
            background-color: #4f46e5;
            color: #ffffff !important;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 12px;
            transition: background-color 0.2s;
            box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
          }

          .expiry-text {
            font-size: 14px;
            color: #94a3b8;
            text-align: center;
            margin-top: 16px;
          }

          .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 32px 0;
          }

          .footer {
            padding: 0 40px 40px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
          }

          .footer-links {
            margin-bottom: 16px;
          }

          .footer-link {
            color: #4f46e5;
            text-decoration: none;
            margin: 0 8px;
          }

          .raw-link {
            word-break: break-all;
            color: #4f46e5;
            text-decoration: underline;
          }

          @media only screen and (max-width: 640px) {
            .container {
              border-radius: 0;
            }
            .content {
              padding: 30px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <span class="logo">BCC007Team</span>
            </div>
            <div class="content">
              <h1 class="title">Reset Password</h1>
              <p class="text">Hello ${name},</p>
              <p class="text">
                You are receiving this email because you requested to reset your password. Please click the button below to reset your password.
              </p>
              
              <div class="cta-box">
                <a href="${url}" class="button" target="_blank" rel="noopener noreferrer">Reset Password</a>
                <p class="expiry-text"> This link will expire in 15 minutes. If the button above doesn’t work, copy and paste this URL into your browser:</p>
              </div>

              <div class="divider"></div>
              
              <p class="text" style="font-size: 14px;">
                If you're having trouble clicking the button, copy and paste this link into your browser:
                <br />
                <a href="${url}" class="raw-link">${url}</a>
              </p>
              
              <p class="text" style="font-size: 14px; margin-top: 24px;">
                If you didn't request to reset your password, you can safely ignore this email.
              </p>
            </div>
            <div class="footer">
              <div class="footer-links">
                <a href="#" class="footer-link">Support</a>
                <a href="#" class="footer-link">Privacy Policy</a>
                <a href="#" class="footer-link">Terms of Service</a>
              </div>
              <p>© ${new Date().getFullYear()} BCC007Team. All rights reserved.</p>
              <p>Lagos, Nigeria</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
export const resetPasswordSuccessTemplate = (name: string) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>Reset Password Success</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }

          .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8fafc;
            padding: 40px 0;
          }

          .container {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            margin: 0 auto;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 40px 20px;
            text-align: center;
          }

          .logo {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.025em;
            text-decoration: none;
          }

          .content {
            padding: 40px;
            color: #1e293b;
          }

          .title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #0f172a;
          }

          .text {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
            color: #475569;
          }

          .cta-box {
            text-align: center;
            margin: 40px 0;
          }

          .button {
            display: inline-block;
            padding: 16px 36px;
            background-color: #4f46e5;
            color: #ffffff !important;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 12px;
            transition: background-color 0.2s;
            box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
          }

          .expiry-text {
            font-size: 14px;
            color: #94a3b8;
            text-align: center;
            margin-top: 16px;
          }

          .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 32px 0;
          }

          .footer {
            padding: 0 40px 40px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
          }

          .footer-links {
            margin-bottom: 16px;
          }

          .footer-link {
            color: #4f46e5;
            text-decoration: none;
            margin: 0 8px;
          }

          .raw-link {
            word-break: break-all;
            color: #4f46e5;
            text-decoration: underline;
          }

          @media only screen and (max-width: 640px) {
            .container {
              border-radius: 0;
            }
            .content {
              padding: 30px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <span class="logo">BCC007Team</span>
            </div>
            <div class="content">
              <h1 class="title">Reset Password Success</h1>
              <p class="text">Hello ${name},</p>
              <p class="text">
                You have successfully reset your password.
              </p>
              
              <p class="text" style="font-size: 14px; margin-top: 24px;">
               If this was not you, kindly reach out to us via our email or social media handles otherwise ignore this email.
              </p>
              <p class="text" style="font-size: 14px; margin-top: 24px;">
                Thank you for using our service.
              </p>
            </div>
            <div class="footer">
              <div class="footer-links">
                <a href="#" class="footer-link">Support</a>
                <a href="#" class="footer-link">Privacy Policy</a>
                <a href="#" class="footer-link">Terms of Service</a>
              </div>
              <p>© ${new Date().getFullYear()} BCC007Team. All rights reserved.</p>
              <p>Lagos, Nigeria</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

export const changeEmailTemplate = (
  name: string,
  email: string,
  url: string,
) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>Change Email</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }

          .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8fafc;
            padding: 40px 0;
          }

          .container {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            margin: 0 auto;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 40px 20px;
            text-align: center;
          }

          .logo {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.025em;
            text-decoration: none;
          }

          .content {
            padding: 40px;
            color: #1e293b;
          }

          .title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #0f172a;
          }

          .text {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
            color: #475569;
          }

          .cta-box {
            text-align: center;
            margin: 40px 0;
          }

          .button {
            display: inline-block;
            padding: 16px 36px;
            background-color: #4f46e5;
            color: #ffffff !important;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 12px;
            transition: background-color 0.2s;
            box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
          }

          .expiry-text {
            font-size: 14px;
            color: #94a3b8;
            text-align: center;
            margin-top: 16px;
          }

          .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 32px 0;
          }

          .footer {
            padding: 0 40px 40px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
          }

          .footer-links {
            margin-bottom: 16px;
          }

          .footer-link {
            color: #4f46e5;
            text-decoration: none;
            margin: 0 8px;
          }

          .raw-link {
            word-break: break-all;
            color: #4f46e5;
            text-decoration: underline;
          }

          @media only screen and (max-width: 640px) {
            .container {
              border-radius: 0;
            }
            .content {
              padding: 30px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <span class="logo">BCC007Team</span>
            </div>
            <div class="content">
              <h1 class="title">Change Email</h1>
              <p class="text">Hello ${name},</p>
              <p class="text">
                You are receiving this email because you requested to change your email to ${email}. Please click the button below to change your email.
              </p>
              
              <div class="cta-box">
                <a href="${url}" class="button" target="_blank" rel="noopener noreferrer">Change Email</a>
                <p class="expiry-text"> This link will expire in 15 minutes. If the button above doesn’t work, copy and paste this URL into your browser:</p>
              </div>

              <div class="divider"></div>
              
              <p class="text" style="font-size: 14px;">
                If you're having trouble clicking the button, copy and paste this link into your browser:
                <br />
                <a href="${url}" class="raw-link">${url}</a>
              </p>
              
              <p class="text" style="font-size: 14px; margin-top: 24px;">
                If you didn't request to change your email, you can safely ignore this email.
              </p>
            </div>
            <div class="footer">
              <div class="footer-links">
                <a href="#" class="footer-link">Support</a>
                <a href="#" class="footer-link">Privacy Policy</a>
                <a href="#" class="footer-link">Terms of Service</a>
              </div>
              <p>© ${new Date().getFullYear()} BCC007Team. All rights reserved.</p>
              <p>Lagos, Nigeria</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
export const confirmDeleteTemplate = (name: string, url: string) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>Confirm Delete</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }

          .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8fafc;
            padding: 40px 0;
          }

          .container {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            margin: 0 auto;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 40px 20px;
            text-align: center;
          }

          .logo {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.025em;
            text-decoration: none;
          }

          .content {
            padding: 40px;
            color: #1e293b;
          }

          .title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #0f172a;
          }

          .text {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
            color: #475569;
          }

          .cta-box {
            text-align: center;
            margin: 40px 0;
          }

          .button {
            display: inline-block;
            padding: 16px 36px;
            background-color: #4f46e5;
            color: #ffffff !important;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 12px;
            transition: background-color 0.2s;
            box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
          }

          .expiry-text {
            font-size: 14px;
            color: #94a3b8;
            text-align: center;
            margin-top: 16px;
          }

          .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 32px 0;
          }

          .footer {
            padding: 0 40px 40px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
          }

          .footer-links {
            margin-bottom: 16px;
          }

          .footer-link {
            color: #4f46e5;
            text-decoration: none;
            margin: 0 8px;
          }

          .raw-link {
            word-break: break-all;
            color: #4f46e5;
            text-decoration: underline;
          }

          @media only screen and (max-width: 640px) {
            .container {
              border-radius: 0;
            }
            .content {
              padding: 30px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <span class="logo">BCC007Team</span>
            </div>
            <div class="content">
              <h1 class="title">Confirm Account Deletion</h1>
              <p class="text">Hello ${name},</p>
              <p class="text">
                You are receiving this email because you requested to delete your account. Please click the button below to delete your account.
              </p>
              
              <div class="cta-box">
                <a href="${url}" class="button" target="_blank" rel="noopener noreferrer">Delete Account</a>
                <p class="expiry-text"> This link will expire in 15 minutes. If the button above doesn’t work, copy and paste this URL into your browser:</p>
              </div>

              <div class="divider"></div>
              
              <p class="text" style="font-size: 14px;">
                If you're having trouble clicking the button, copy and paste this link into your browser:
                <br />
                <a href="${url}" class="raw-link">${url}</a>
              </p>
              
              <p class="text" style="font-size: 14px; margin-top: 24px;">
                If you didn't request to delete your account, you can safely ignore this email.
              </p>
            </div>
            <div class="footer">
              <div class="footer-links">
                <a href="#" class="footer-link">Support</a>
                <a href="#" class="footer-link">Privacy Policy</a>
                <a href="#" class="footer-link">Terms of Service</a>
              </div>
              <p>© ${new Date().getFullYear()} BCC007Team. All rights reserved.</p>
              <p>Lagos, Nigeria</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
export const confirmChangeEmailTemplate = (
  name: string,
  newEmail: string,
  url: string,
) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>Confirm Email Change</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }

          .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8fafc;
            padding: 40px 0;
          }

          .container {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            margin: 0 auto;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 40px 20px;
            text-align: center;
          }

          .logo {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.025em;
            text-decoration: none;
          }

          .content {
            padding: 40px;
            color: #1e293b;
          }

          .title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #0f172a;
          }

          .text {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
            color: #475569;
          }

          .cta-box {
            text-align: center;
            margin: 40px 0;
          }

          .button {
            display: inline-block;
            padding: 16px 36px;
            background-color: #4f46e5;
            color: #ffffff !important;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 12px;
            transition: background-color 0.2s;
            box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
          }

          .expiry-text {
            font-size: 14px;
            color: #94a3b8;
            text-align: center;
            margin-top: 16px;
          }

          .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 32px 0;
          }

          .footer {
            padding: 0 40px 40px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
          }

          .footer-links {
            margin-bottom: 16px;
          }

          .footer-link {
            color: #4f46e5;
            text-decoration: none;
            margin: 0 8px;
          }

          .raw-link {
            word-break: break-all;
            color: #4f46e5;
            text-decoration: underline;
          }

          @media only screen and (max-width: 640px) {
            .container {
              border-radius: 0;
            }
            .content {
              padding: 30px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <span class="logo">BCC007Team</span>
            </div>
            <div class="content">
              <h1 class="title">Confirm Email Change</h1>
              <p class="text">Hello ${name},</p>
              <p class="text">
                You are receiving this email because you requested to change your email to ${newEmail}. Please click the button below to confirm your email change.
              </p>
              
              <div class="cta-box">
                <a href="${url}" class="button" target="_blank" rel="noopener noreferrer">Confirm Email Change</a>
                <p class="expiry-text"> This link will expire in 15 minutes. If the button above doesn’t work, copy and paste this URL into your browser:</p>
              </div>

              <div class="divider"></div>
              
              <p class="text" style="font-size: 14px;">
                If you're having trouble clicking the button, copy and paste this link into your browser:
                <br />
                <a href="${url}" class="raw-link">${url}</a>
              </p>
              
              <p class="text" style="font-size: 14px; margin-top: 24px;">
                If you didn't request to change your email, you can safely ignore this email.
              </p>
            </div>
            <div class="footer">
              <div class="footer-links">
                <a href="#" class="footer-link">Support</a>
                <a href="#" class="footer-link">Privacy Policy</a>
                <a href="#" class="footer-link">Terms of Service</a>
              </div>
              <p>© ${new Date().getFullYear()} BCC007Team. All rights reserved.</p>
              <p>Lagos, Nigeria</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

export const roleAssignedTemplate = (name: string, role: string) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>Your role has been changed</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }

          .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8fafc;
            padding: 40px 0;
          }

          .container {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            margin: 0 auto;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 40px 20px;
            text-align: center;
          }

          .logo {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.025em;
            text-decoration: none;
          }

          .content {
            padding: 40px;
            color: #1e293b;
          }

          .title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #0f172a;
          }

          .text {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
            color: #475569;
          }

          .cta-box {
            text-align: center;
            margin: 40px 0;
          }

          .button {
            display: inline-block;
            padding: 16px 36px;
            background-color: #4f46e5;
            color: #ffffff !important;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 12px;
            transition: background-color 0.2s;
            box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
          }

          .expiry-text {
            font-size: 14px;
            color: #94a3b8;
            text-align: center;
            margin-top: 16px;
          }

          .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 32px 0;
          }

          .footer {
            padding: 0 40px 40px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
          }

          .footer-links {
            margin-bottom: 16px;
          }

          .footer-link {
            color: #4f46e5;
            text-decoration: none;
            margin: 0 8px;
          }

          .raw-link {
            word-break: break-all;
            color: #4f46e5;
            text-decoration: underline;
          }

          @media only screen and (max-width: 640px) {
            .container {
              border-radius: 0;
            }
            .content {
              padding: 30px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <span class="logo">BCC007Team</span>
            </div>
            <div class="content">
              <h1 class="title">Your role has been changed</h1>
              <p class="text">Hello ${name},</p>
              <p class="text">
                Your role has been changed to ${role}. We trust that you will continue to uphold the values of BCC007Team.
              </p>
              <div class="divider"></div>
            </div>
            <div class="footer">
              <div class="footer-links">
                <a href="#" class="footer-link">Support</a>
                <a href="#" class="footer-link">Privacy Policy</a>
                <a href="#" class="footer-link">Terms of Service</a>
              </div>
              <p>© ${new Date().getFullYear()} BCC007Team. All rights reserved.</p>
              <p>Lagos, Nigeria</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
export const eventCreatedTemplate = (name: string, title: string) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>Event created</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }

          .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8fafc;
            padding: 40px 0;
          }

          .container {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            margin: 0 auto;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 40px 20px;
            text-align: center;
          }

          .logo {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.025em;
            text-decoration: none;
          }

          .content {
            padding: 40px;
            color: #1e293b;
          }

          .title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #0f172a;
          }

          .text {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
            color: #475569;
          }

          .cta-box {
            text-align: center;
            margin: 40px 0;
          }

          .button {
            display: inline-block;
            padding: 16px 36px;
            background-color: #4f46e5;
            color: #ffffff !important;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 12px;
            transition: background-color 0.2s;
            box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
          }

          .expiry-text {
            font-size: 14px;
            color: #94a3b8;
            text-align: center;
            margin-top: 16px;
          }

          .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 32px 0;
          }

          .footer {
            padding: 0 40px 40px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
          }

          .footer-links {
            margin-bottom: 16px;
          }

          .footer-link {
            color: #4f46e5;
            text-decoration: none;
            margin: 0 8px;
          }

          .raw-link {
            word-break: break-all;
            color: #4f46e5;
            text-decoration: underline;
          }

          @media only screen and (max-width: 640px) {
            .container {
              border-radius: 0;
            }
            .content {
              padding: 30px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <span class="logo">BCC007Team</span>
            </div>
            <div class="content">
              <h1 class="title">Event created</h1>
              <p class="text">Hello ${name},</p>
              <p class="text">
                Your event <b>${title}</b> has been created successfully. Please check your dashboard for more details.
              </p>
              <div class="divider"></div>
            </div>
            <div class="footer">
              <div class="footer-links">
                <a href="#" class="footer-link">Support</a>
                <a href="#" class="footer-link">Privacy Policy</a>
                <a href="#" class="footer-link">Terms of Service</a>
              </div>
              <p>© ${new Date().getFullYear()} BCC007Team. All rights reserved.</p>
              <p>Lagos, Nigeria</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

export const ticketCreatedTemplate = (name: string, ticketId: string) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>Ticket created</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }

          .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8fafc;
            padding: 40px 0;
          }

          .container {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            margin: 0 auto;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 40px 20px;
            text-align: center;
          }

          .logo {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.025em;
            text-decoration: none;
          }

          .content {
            padding: 40px;
            color: #1e293b;
          }

          .title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #0f172a;
          }

          .text {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
            color: #475569;
          }

          .cta-box {
            text-align: center;
            margin: 40px 0;
          }

          .button {
            display: inline-block;
            padding: 16px 36px;
            background-color: #4f46e5;
            color: #ffffff !important;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 12px;
            transition: background-color 0.2s;
            box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
          }

          .expiry-text {
            font-size: 14px;
            color: #94a3b8;
            text-align: center;
            margin-top: 16px;
          }

          .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 32px 0;
          }

          .footer {
            padding: 0 40px 40px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
          }

          .footer-links {
            margin-bottom: 16px;
          }

          .footer-link {
            color: #4f46e5;
            text-decoration: none;
            margin: 0 8px;
          }

          .raw-link {
            word-break: break-all;
            color: #4f46e5;
            text-decoration: underline;
          }

          @media only screen and (max-width: 640px) {
            .container {
              border-radius: 0;
            }
            .content {
              padding: 30px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <span class="logo">BCC007Team</span>
            </div>
            <div class="content">
              <h1 class="title">Ticket created</h1>
              <p class="text">Hello ${name},</p>
              <p class="text">
                Your ticket <b>${ticketId}</b> has been created successfully. Please check your dashboard for more details.
              </p>
              <div class="divider"></div>
            </div>
            <div class="footer">
              <div class="footer-links">
                <a href="#" class="footer-link">Support</a>
                <a href="#" class="footer-link">Privacy Policy</a>
                <a href="#" class="footer-link">Terms of Service</a>
              </div>
              <p>© ${new Date().getFullYear()} BCC007Team. All rights reserved.</p>
              <p>Lagos, Nigeria</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

export const ticketIssueAssignedTemplate = (name: string, ticketId: string) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>Ticket assigned</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }

          .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8fafc;
            padding: 40px 0;
          }

          .container {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            margin: 0 auto;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 40px 20px;
            text-align: center;
          }

          .logo {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.025em;
            text-decoration: none;
          }

          .content {
            padding: 40px;
            color: #1e293b;
          }

          .title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #0f172a;
          }

          .text {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
            color: #475569;
          }

          .cta-box {
            text-align: center;
            margin: 40px 0;
          }

          .button {
            display: inline-block;
            padding: 16px 36px;
            background-color: #4f46e5;
            color: #ffffff !important;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 12px;
            transition: background-color 0.2s;
            box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
          }

          .expiry-text {
            font-size: 14px;
            color: #94a3b8;
            text-align: center;
            margin-top: 16px;
          }

          .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 32px 0;
          }

          .footer {
            padding: 0 40px 40px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
          }

          .footer-links {
            margin-bottom: 16px;
          }

          .footer-link {
            color: #4f46e5;
            text-decoration: none;
            margin: 0 8px;
          }

          .raw-link {
            word-break: break-all;
            color: #4f46e5;
            text-decoration: underline;
          }

          @media only screen and (max-width: 640px) {
            .container {
              border-radius: 0;
            }
            .content {
              padding: 30px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <span class="logo">BCC007Team</span>
            </div>
            <div class="content">
              <h1 class="title">Ticket issue assigned</h1>
              <p class="text">Hello ${name},</p>
              <p class="text">
                Ticket <b>${ticketId}</b> has been assigned to you for your attention. Please handle and resolve it as soon as possible. Thank you.
              </p>
              <div class="divider"></div>
            </div>
            <div class="footer">
              <div class="footer-links">
                <a href="#" class="footer-link">Support</a>
                <a href="#" class="footer-link">Privacy Policy</a>
                <a href="#" class="footer-link">Terms of Service</a>
              </div>
              <p>© ${new Date().getFullYear()} BCC007Team. All rights reserved.</p>
              <p>Lagos, Nigeria</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
export const ticketIssueResolvedTemplate = (name: string, ticketId: string) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>Ticket issue resolved</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }

          .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8fafc;
            padding: 40px 0;
          }

          .container {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            margin: 0 auto;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 40px 20px;
            text-align: center;
          }

          .logo {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.025em;
            text-decoration: none;
          }

          .content {
            padding: 40px;
            color: #1e293b;
          }

          .title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #0f172a;
          }

          .text {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
            color: #475569;
          }

          .cta-box {
            text-align: center;
            margin: 40px 0;
          }

          .button {
            display: inline-block;
            padding: 16px 36px;
            background-color: #4f46e5;
            color: #ffffff !important;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 12px;
            transition: background-color 0.2s;
            box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
          }

          .expiry-text {
            font-size: 14px;
            color: #94a3b8;
            text-align: center;
            margin-top: 16px;
          }

          .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 32px 0;
          }

          .footer {
            padding: 0 40px 40px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
          }

          .footer-links {
            margin-bottom: 16px;
          }

          .footer-link {
            color: #4f46e5;
            text-decoration: none;
            margin: 0 8px;
          }

          .raw-link {
            word-break: break-all;
            color: #4f46e5;
            text-decoration: underline;
          }

          @media only screen and (max-width: 640px) {
            .container {
              border-radius: 0;
            }
            .content {
              padding: 30px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <span class="logo">BCC007Team</span>
            </div>
            <div class="content">
              <h1 class="title">Ticket issue resolved</h1>
              <p class="text">Hello ${name},</p>
              <p class="text">
                Ticket <b>${ticketId}</b> has been resolved. Thank you for your patience.
              </p>
              <div class="divider"></div>
            </div>
            <div class="footer">
              <div class="footer-links">
                <a href="#" class="footer-link">Support</a>
                <a href="#" class="footer-link">Privacy Policy</a>
                <a href="#" class="footer-link">Terms of Service</a>
              </div>
              <p>© ${new Date().getFullYear()} BCC007Team. All rights reserved.</p>
              <p>Lagos, Nigeria</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

export const paymemtConfirmationTemplate = (
  name: string,
  amount: string,
  reference: string,
) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>Payment Confirmation</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }

          .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8fafc;
            padding: 40px 0;
          }

          .container {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            margin: 0 auto;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 40px 20px;
            text-align: center;
          }

          .logo {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.025em;
            text-decoration: none;
          }

          .content {
            padding: 40px;
            color: #1e293b;
          }

          .title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #0f172a;
          }

          .text {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
            color: #475569;
          }

          .cta-box {
            text-align: center;
            margin: 40px 0;
          }

          .button {
            display: inline-block;
            padding: 16px 36px;
            background-color: #4f46e5;
            color: #ffffff !important;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 12px;
            transition: background-color 0.2s;
            box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
          }

          .expiry-text {
            font-size: 14px;
            color: #94a3b8;
            text-align: center;
            margin-top: 16px;
          }

          .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 32px 0;
          }

          .footer {
            padding: 0 40px 40px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
          }

          .footer-links {
            margin-bottom: 16px;
          }

          .footer-link {
            color: #4f46e5;
            text-decoration: none;
            margin: 0 8px;
          }

          .raw-link {
            word-break: break-all;
            color: #4f46e5;
            text-decoration: underline;
          }

          @media only screen and (max-width: 640px) {
            .container {
              border-radius: 0;
            }
            .content {
              padding: 30px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <span class="logo">BCC007Team</span>
            </div>
            <div class="content">
              <h1 class="title">Payment Confirmation</h1>
              <p class="text">Hello ${name},</p>
              <p class="text">
                Your payment of <b>${amount}</b> with reference <b>${reference}</b> has been confirmed.
              </p>
              <div class="divider"></div>
            </div>
            <div class="footer">
              <div class="footer-links">
                <a href="#" class="footer-link">Support</a>
                <a href="#" class="footer-link">Privacy Policy</a>
                <a href="#" class="footer-link">Terms of Service</a>
              </div>
              <p>© ${new Date().getFullYear()} BCC007Team. All rights reserved.</p>
              <p>Lagos, Nigeria</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

export const cancelSubscriptionTemplate = (name: string) => `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <title>Subscription cancellation</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }

          .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8fafc;
            padding: 40px 0;
          }

          .container {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
            margin: 0 auto;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 40px 20px;
            text-align: center;
          }

          .logo {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.025em;
            text-decoration: none;
          }

          .content {
            padding: 40px;
            color: #1e293b;
          }

          .title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 16px;
            color: #0f172a;
          }

          .text {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
            color: #475569;
          }

          .cta-box {
            text-align: center;
            margin: 40px 0;
          }

          .button {
            display: inline-block;
            padding: 16px 36px;
            background-color: #4f46e5;
            color: #ffffff !important;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 12px;
            transition: background-color 0.2s;
            box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
          }

          .expiry-text {
            font-size: 14px;
            color: #94a3b8;
            text-align: center;
            margin-top: 16px;
          }

          .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 32px 0;
          }

          .footer {
            padding: 0 40px 40px;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
          }

          .footer-links {
            margin-bottom: 16px;
          }

          .footer-link {
            color: #4f46e5;
            text-decoration: none;
            margin: 0 8px;
          }

          .raw-link {
            word-break: break-all;
            color: #4f46e5;
            text-decoration: underline;
          }

          @media only screen and (max-width: 640px) {
            .container {
              border-radius: 0;
            }
            .content {
              padding: 30px 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <span class="logo">BCC007Team</span>
            </div>
            <div class="content">
              <h1 class="title">Subscription cancellation</h1>
              <p class="text">Hello ${name},</p>
              <p class="text">
                You have successfully cancelled your BCC007Team membership monthly dues subscription. Please remember to pay your dues monthly to avoid any disruption in your membership.
              </p>
              <div class="divider"></div>
            </div>
            <div class="footer">
              <div class="footer-links">
                <a href="#" class="footer-link">Support</a>
                <a href="#" class="footer-link">Privacy Policy</a>
                <a href="#" class="footer-link">Terms of Service</a>
              </div>
              <p>© ${new Date().getFullYear()} BCC007Team. All rights reserved.</p>
              <p>Lagos, Nigeria</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
