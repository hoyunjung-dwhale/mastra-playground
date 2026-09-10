import type { MastraDBMessage } from '@mastra/core/memory';
import type { ProcessInputArgs, Processor } from '@mastra/core/processors';

// 텍스트는 message.content.parts 안의 text part에 있다. 다른 part(이미지, 도구 호출)는 건드리지 않는다.
export const inputNormalizer: Processor & Required<Pick<Processor, 'processInput'>> = {
  id: 'input-normalizer',
  processInput: ({ messages }: ProcessInputArgs): MastraDBMessage[] =>
    messages.map((message) => ({
      ...message,
      content: {
        ...message.content,
        parts: message.content.parts?.map((part) =>
          part.type === 'text' ? { ...part, text: normalize(part.text) } : part,
        ),
      },
    })),
};

// 줄바꿈은 합치지 않는다. 여러 줄 붙여넣기(코드, 명단)의 구조가 뭉개지기 때문이다.
function normalize(text: string): string {
  return text
    .normalize('NFC')
    .replace(/[ \t]+/g, ' ')
    .trim();
}
