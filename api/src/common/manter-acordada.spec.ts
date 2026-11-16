import {
  INTERVALO_MANTER_ACORDADA_MS,
  manterAcordada,
} from './manter-acordada';

describe('manter a API acordada', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('fora do Render (sem RENDER_EXTERNAL_URL) não faz nada', () => {
    const chamar = jest.fn();
    expect(manterAcordada(undefined, 1000, chamar)).toBeNull();
    jest.advanceTimersByTime(10_000);
    expect(chamar).not.toHaveBeenCalled();
  });

  it('chama o próprio /health pelo endereço público a cada intervalo', () => {
    const chamar = jest.fn().mockResolvedValue(undefined);
    const timer = manterAcordada(
      'https://finances.onrender.com/',
      9 * 60_000,
      chamar,
    );
    expect(chamar).not.toHaveBeenCalled();
    jest.advanceTimersByTime(9 * 60_000);
    expect(chamar).toHaveBeenCalledWith('https://finances.onrender.com/health');
    jest.advanceTimersByTime(2 * 9 * 60_000);
    expect(chamar).toHaveBeenCalledTimes(3);
    clearInterval(timer!);
  });

  it('uma chamada que falha não derruba nada e a próxima continua', async () => {
    const chamar = jest
      .fn()
      .mockRejectedValueOnce(new Error('sem rede'))
      .mockResolvedValue(undefined);
    const timer = manterAcordada('https://x.onrender.com', 1000, chamar);
    jest.advanceTimersByTime(1000);
    await Promise.resolve();
    jest.advanceTimersByTime(1000);
    expect(chamar).toHaveBeenCalledTimes(2);
    clearInterval(timer!);
  });

  it('o intervalo fica abaixo dos 15 min em que o Render desliga', () => {
    expect(INTERVALO_MANTER_ACORDADA_MS).toBeLessThan(15 * 60_000);
  });
});
