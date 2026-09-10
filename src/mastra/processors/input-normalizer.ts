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

// TODO: 정규화 규칙을 정한다. 앞뒤 공백 제거, 유니코드 NFC 정규화, 연속 공백 하나로 등.
// 여러 줄 붙여넣기의 줄바꿈을 뭉개지 않도록 어디까지 합칠지 정한다.
function normalize(text: string): string {
  return text;
}
