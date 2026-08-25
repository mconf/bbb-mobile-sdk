const POLL_TYPES = {
  YesNo: 'YN',
  YesNoAbstention: 'YNA',
  TrueFalse: 'TF',
  Letter: 'A-',
  Custom: 'CUSTOM',
  Response: 'R-',
};

const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const DEFAULT_LETTER_COUNT = 4;

const trimmed = (options) => options
  .map((option) => option.trim())
  .filter((option) => option.length > 0);

const sameAnswers = (options, expected) => options.length === expected.length
  && options.every((option, index) => (
    option.toLowerCase() === expected[index].trim().toLowerCase()
  ));

const defaultOptionsFor = (type, t) => {
  switch (type) {
    case POLL_TYPES.TrueFalse:
      return [t('app.poll.answer.true'), t('app.poll.answer.false')];
    case POLL_TYPES.YesNoAbstention:
      return [
        t('app.poll.answer.yes'),
        t('app.poll.answer.no'),
        t('app.poll.answer.abstention'),
      ];
    case POLL_TYPES.Letter:
      return LETTERS.slice(0, DEFAULT_LETTER_COUNT);
    case POLL_TYPES.Custom:
      return ['', ''];
    default:
      return [];
  }
};

const hasAnswerOptions = (type) => type != null && type !== POLL_TYPES.Response;

const resolvePollType = (type, options, t) => {
  if (type === POLL_TYPES.Response) return POLL_TYPES.Response;

  const answers = trimmed(options);

  switch (type) {
    case POLL_TYPES.Letter: {
      const isLetterSequence = answers.length >= 2
        && answers.length <= LETTERS.length
        && answers.every((answer, index) => answer.toUpperCase() === LETTERS[index]);
      return isLetterSequence ? `${POLL_TYPES.Letter}${answers.length}` : POLL_TYPES.Custom;
    }
    case POLL_TYPES.TrueFalse:
      return sameAnswers(answers, defaultOptionsFor(POLL_TYPES.TrueFalse, t))
        ? POLL_TYPES.TrueFalse
        : POLL_TYPES.Custom;
    case POLL_TYPES.YesNoAbstention:
      if (sameAnswers(answers, defaultOptionsFor(POLL_TYPES.YesNoAbstention, t))) {
        return POLL_TYPES.YesNoAbstention;
      }
      if (sameAnswers(answers, [t('app.poll.answer.yes'), t('app.poll.answer.no')])) {
        return POLL_TYPES.YesNo;
      }
      return POLL_TYPES.Custom;
    default:
      return POLL_TYPES.Custom;
  }
};

const CANONICAL_ANSWERS = ['True', 'False', 'Yes', 'No', 'Abstention', 'A', 'B', 'C', 'D', 'E'];

const canonicalAnswerKey = (value, t) => {
  const normalized = value.trim().toLowerCase();
  const canonical = CANONICAL_ANSWERS.find((answer) => (
    t(`app.poll.answer.${answer.toLowerCase()}`).trim().toLowerCase() === normalized
  ));
  return canonical ?? value.trim();
};

const isLocalizedType = (type) => type != null
  && type !== POLL_TYPES.Custom
  && type !== POLL_TYPES.Response;

const answerLabel = (optionDesc, type, t) => {
  if (!isLocalizedType(type)) return optionDesc;
  const key = `app.poll.answer.${optionDesc}`.toLowerCase();
  const label = t(key);
  return label === key ? optionDesc : label;
};

const typeLabel = (type, t) => {
  if (type == null) return '';
  if (type.startsWith(POLL_TYPES.Letter)) {
    const count = Number(type.split('-')[1]) || DEFAULT_LETTER_COUNT;
    return LETTERS.slice(0, count).join(' / ');
  }
  switch (type) {
    case POLL_TYPES.TrueFalse:
      return t('app.poll.tf');
    case POLL_TYPES.YesNoAbstention:
      return t('app.poll.yna');
    case POLL_TYPES.YesNo:
      return `${t('app.poll.answer.yes')} / ${t('app.poll.answer.no')}`;
    case POLL_TYPES.Response:
      return t('mobileSdk.poll.createPoll.typedResponse');
    default:
      return t('mobileSdk.poll.createPoll.customType');
  }
};

export {
  POLL_TYPES,
  answerLabel,
  canonicalAnswerKey,
  defaultOptionsFor,
  hasAnswerOptions,
  isLocalizedType,
  resolvePollType,
  typeLabel,
};
