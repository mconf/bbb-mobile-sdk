import { renderHook } from '@testing-library/react';
import { useState, version } from 'react';
import { version as domVersion } from 'react-dom';
import { expect, it } from 'vitest';

it('runs on React 18.2, with Testing Library on the same React', () => {
  const { result } = renderHook(() => useState('rendered'));
  expect([version, domVersion, result.current[0]]).toEqual(['18.2.0', '18.2.0', 'rendered']);
});
