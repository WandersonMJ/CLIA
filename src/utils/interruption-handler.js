import readline from 'readline';

/**
 * Módulo responsável por gerenciar a interrupção da IA via tecla ESC.
 */
class InterruptionHandler {
  constructor() {
    this.interrupted = false;
    this.isListening = false;
    this.keypressHandler = null;
  }

  /**
   * Ativa o listener da tecla ESC.
   * Deve ser chamado quando a IA começar a processar.
   */
  startListening() {
    if (this.isListening) return;

    this.interrupted = false;
    this.isListening = true;

    // Configurar readline para capturar teclas
    if (process.stdin.isTTY) {
      // Criar handler persistente
      this.keypressHandler = (str, key) => {
        if (!this.isListening) return;

        // Detectar ESC (escape key) - código 27
        if (key && (key.name === 'escape' || key.sequence === '\u001b')) {
          this.interrupted = true;
          console.log('\n\n⚠️  Interrupção solicitada (ESC). Finalizando processamento...\n');
        }
      };

      readline.emitKeypressEvents(process.stdin);

      // Salvar estado anterior
      this.wasRaw = process.stdin.isRaw;

      if (!process.stdin.isRaw) {
        process.stdin.setRawMode(true);
      }

      process.stdin.on('keypress', this.keypressHandler);

      // Resumir o stdin para receber input
      if (process.stdin.isPaused()) {
        process.stdin.resume();
      }
    }
  }

  /**
   * Desativa o listener da tecla ESC.
   * Deve ser chamado quando a IA terminar de processar.
   */
  stopListening() {
    if (!this.isListening) return;

    this.isListening = false;

    // Remover listener
    if (process.stdin.isTTY && this.keypressHandler) {
      process.stdin.removeListener('keypress', this.keypressHandler);

      // Restaurar estado anterior do raw mode
      if (!this.wasRaw && process.stdin.isRaw) {
        process.stdin.setRawMode(false);
      }

      this.keypressHandler = null;
    }
  }

  /**
   * Verifica se houve uma interrupção.
   * @returns {boolean} true se ESC foi pressionado, false caso contrário.
   */
  isInterrupted() {
    return this.interrupted;
  }

  /**
   * Reseta o estado de interrupção.
   */
  reset() {
    this.interrupted = false;
  }
}

// Exportar uma instância única (singleton)
const interruptionHandler = new InterruptionHandler();
export default interruptionHandler;
