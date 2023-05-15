/*
Copyright 2019-2022 Gravitational, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';

import FormLogin from 'teleport/components/FormLogin';
import Logo from 'teleport/components/LogoHero';
import styled from 'styled-components';
import useLogin, { State } from './useLogin';

const logoSrc = require('design/assets/images/logo.png');
import bgImg from './bgImg.png';
export default function Container() {
  const state = useLogin();
  return <Login {...state} />;
}

export function Login({
  attempt,
  onLogin,
  onLoginWithWebauthn,
  onLoginWithSso,
  authProviders,
  auth2faType,
  preferredMfaType,
  isLocalAuthEnabled,
  clearAttempt,
  isPasswordlessEnabled,
  primaryAuthType,
  privateKeyPolicyEnabled,
}: State) {
  return (
    <>
      <LoginPage>
        <Logo className='logo-box' src={logoSrc} height={60} maxWidth={370}  width={372}/>
        <div className='login-box'>
          <div className="title-box">
            <div className="title">欢迎登录PAM管控平台</div>
            <div className="sub-title"> 请登录你的账号，开始使用</div>
          </div>
          <FormLogin
            authProviders={authProviders}
            auth2faType={auth2faType}
            preferredMfaType={preferredMfaType}
            isLocalAuthEnabled={isLocalAuthEnabled}
            onLoginWithSso={onLoginWithSso}
            onLoginWithWebauthn={onLoginWithWebauthn}
            onLogin={onLogin}
            attempt={attempt}
            clearAttempt={clearAttempt}
            isPasswordlessEnabled={isPasswordlessEnabled}
            primaryAuthType={primaryAuthType}
            privateKeyPolicyEnabled={privateKeyPolicyEnabled}
          />
        </div>
      </LoginPage>
    </>
  );
}
// 样式
const LoginPage = styled.div`
  background: url(${bgImg}) no-repeat;
  background-size: cover;
  height:100vh;
     .logo-box {
        position: absolute;
        margin-left:60px;
        margin-top:60px
     }
    .login-box {
      width: 640px;
      position: absolute;
      right: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: rgba(255,255,255,0.4);
      border-radius: 0px 0px 0px 0px;
      height: 100vh;
      .title-box {
        margin-left: auto;
        margin-right: auto;
        width: 380px;
           .title {
 
             font-size: 28px;
             font-weight: bold;
             line-height: 28px;
             color: #333333;
           }
            .sub-title {
              margin-top:30px;
              font-size: 18px;
              font-weight: 400;
         
              color: #4E5969;
              line-height: 18px;
            }
      
      }


    }
  
`
