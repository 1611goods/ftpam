/*
Copyright 2021-2022 Gravitational, Inc.

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

import React, { SetStateAction } from 'react';
import styled from 'styled-components';

import { height, space, color } from 'design/system';

export default function InputSearch({
  searchValue,
  setSearchValue,
  children,
}: Props) {
  return (
    <Wrapper>
      <StyledInput
        placeholder="搜索..."
        px={3}
        bg="#ffffff"
        color="#86909C"
        value={searchValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchValue(e.target.value)
        }
      />
      {/*<ChildWrapper>{children}</ChildWrapper>*/}
    </Wrapper>
  );
}

type Props = {
  searchValue: string;
  setSearchValue: React.Dispatch<SetStateAction<string>>;
  children?: JSX.Element;
};

const ChildWrapper = styled.div`
  position: absolute;
  height: 100%;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.primary.lighter};
  border-radius: 200px;
`;

const Wrapper = styled.div`
  position: relative;
  display: flex;
  overflow: hidden;
  width: 100%;
  border-radius: 200px;
  height: 32px;
  background:#ffffff;
  // background: ${props => props.theme.colors.primary.dark};
`;

const StyledInput = styled.input`
  border: 1px solid #D4D6D9;
  outline: none;
  box-sizing: border-box;
  height: 100%;
  font-size: 12px;
  width: 100%;
  transition: all 0.2s;
  border-radius: 34px 34px 34px 34px;
  ${color}
  ${space}
  ${height}
  ${fromTheme};
  // padding-right: 184px;
`;

function fromTheme(props) {
  return {
    color: props.theme.colors.inputText.placeholder,
    background: props.theme.colors.light,

    '&: hover, &:focus, &:active': {
      background: props.theme.colors.light,
      // boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, .24)',
      color: props.theme.colors.inputText.placeholder,
    },
    '&::placeholder': {
      color: props.theme.colors.inputText.placeholder,
      fontSize: props.theme.fontSizes[1],
    },
  };
}
