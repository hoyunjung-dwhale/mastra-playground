import type {
  ProcessOutputResultArgs,
  ProcessOutputStreamArgs,
  Processor,
} from '@mastra/core/processors';
import type { ChunkType } from '@mastra/core/stream';

// TODO: 사용자에게 보이면 안 되는 문자열의 패턴을 정한다. (예: 내부 경로, 저장소 id 형식, 특정 단어)
const BLOCKED_PATTERN = /$^/;

// 화면에 보이기 전에 막아야 하므로 스트림 훅에서 거른다. processOutputResult 시점에는 청크가
// 이미 클라이언트로 나간 뒤다. 청크 하나(몇 글자)만 보이므로 경계에 걸친 패턴은 놓친다.
// state는 이 프로세서 id로 격리된 요청 단위 메모라, 스트림 훅에서 센 값을 결과 훅에서 읽는다.
export const outputFilter: Processor &
  Required<Pick<Processor, 'processOutputStream' | 'processOutputResult'>> = {
  id: 'output-filter',

  processOutputStream: async ({
    part,
    state,
  }: ProcessOutputStreamArgs): Promise<ChunkType | null> => {
    if (part.type === 'text-delta' && BLOCKED_PATTERN.test(part.payload.text)) {
      state.dropped = ((state.dropped as number | undefined) ?? 0) + 1;
      // TODO: 청크를 버릴지(null), 가린 텍스트로 바꿔 내보낼지 정한다.
      return null;
    }
    return part;
  },

  processOutputResult: async ({ messages }: ProcessOutputResultArgs) => {
    // TODO: 인자에 state를 추가해 state.dropped를 어디에 남길지 정한다.
    // (로그, 메시지 metadata, 또는 abort로 응답 자체를 막기)
    return messages;
  },
};
