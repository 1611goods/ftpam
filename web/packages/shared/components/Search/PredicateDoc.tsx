/**
 * Copyright 2023 Gravitational, Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { Text, Link } from 'design';

const GUIDE_URL =
  'https://goteleport.com/docs/setup/reference/predicate-language/#resource-filtering';

export const PredicateDoc = () => (
  <>
    <Text typography="paragraph2">
      高级搜索允许您使用谓词语言执行更复杂的搜索。该语言支持基本运算符:{' '}
      <Text as="span" bold>
        <code>==</code>{' '}
      </Text>
      ,{' '}
      <Text as="span" bold>
        <code>!=</code>
      </Text>
      ,{' '}
      <Text as="span" bold>
        <code>&&</code>
      </Text>
      , and{' '}
      <Text as="span" bold>
        <code>||</code>
      </Text>
    </Text>
    <Text typography="h4" mt={2} mb={1}>
      使用示例
    </Text>
    <Text typography="paragraph2">
      标签匹配:{' '}
      <Text ml={1} as="span" bold>
        <code>labels["key"] == "value" && labels["key2"] != "value2"</code>{' '}
      </Text>
      <br />
      模糊搜索:{' '}
      <Text ml={1} as="span" bold>
        <code>search("foo", "bar", "some phrase")</code>
      </Text>
      <br />
      组合:{' '}
      <Text ml={1} as="span" bold>
        <code>labels["key1"] == "value1" && search("foo")</code>
      </Text>
    </Text>
    <Text typography="paragraph2" mt={2}>
      看看我们的{' '}
      <Link href={GUIDE_URL} target="_blank">
        查看语言指南
      </Link>{' '}
      了解有关该语言的更深入解释。
    </Text>
  </>
);
