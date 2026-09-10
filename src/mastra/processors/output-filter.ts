import type {
  ProcessOutputResultArgs,
  ProcessOutputStreamArgs,
  Processor,
} from '@mastra/core/processors';
import type { ChunkType } from '@mastra/core/stream';

// 구현 내부(저장 파일, 의존성 경로)를 답변에 드러내지 않는다.
const BLOCKED_PATTERN = /mastra\.db|node_modules/;
const MASK = '***';

// 화면에 보이기 전에 막아야 하므로 스트림 훅에서 거른다. processOutputResult 시점에는 청크가
// 이미 클라이언트로 나간 뒤다. 청크 하나(몇 글자)만 보이므로 경계에 걸친 패턴은 놓친다.
// state는 이 프로세서 id로 격리된 요청 단위 메모라, 스트림 훅에서 센 값을 결과 훅에서 읽는다.
export const outputFilter: Processor &
  Required<Pick<Processor, 'processOutputStream' | 'processOutputResult'>> = {
  id: 'output-filter',

  // 청크를 버리면 문장이 끊겨 읽히므로 가린 텍스트로 바꿔 내보낸다.
  processOutputStream: async ({ part, state }: ProcessOutputStreamArgs): Promise<ChunkType> => {
    if (part.type === 'text-delta' && BLOCKED_PATTERN.test(part.payload.text)) {
      state.filtered = ((state.filtered as number | undefined) ?? 0) + 1;
      return {
        ...part,
        payload: { ...part.payload, text: part.payload.text.replace(BLOCKED_PATTERN, MASK) },
      };
    }
    return part;
  },

  // 걸러진 횟수를 assistant 메시지 metadata에 남긴다. 모델에게는 안 가고, 저장되며,
  // 프론트엔드가 "일부 내용이 가려졌다"는 표시를 붙일 수 있다.
  processOutputResult: async ({ messages, state }: ProcessOutputResultArgs) => {
    const filtered = (state.filtered as number | undefined) ?? 0;
    if (filtered === 0) {
      return messages;
    }
    return messages.map((message) =>
      message.role === 'assistant'
        ? {
            ...message,
            content: {
              ...message.content,
              metadata: { ...message.content.metadata, filteredChunks: filtered },
            },
          }
        : message,
    );
  },
};
