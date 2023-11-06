import { ServerTiming } from './index';

describe('basic', () => {
  it('should track basic actions', () => {
    const t = new ServerTiming();

    const testEvent = t.addEvent('test', 'testing');
    setTimeout(() => {
      testEvent.end();
    }, 100);

    setTimeout(() => {
      const expected = 'test;desc="testing";dur=101';
      const actual = t.headerValue();

      expect(actual).toEqual(expected);
    }, 1000);
  });
});
