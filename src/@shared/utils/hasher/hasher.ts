import * as bcrypt from 'bcrypt';

export default class Hasher {
  private constructor() {}

  private static readonly SALT_ROUNDS: number = 8;

  /**
   * Gera um hash seguro para uma senha.
   * @param password Senha em texto puro
   * @param saltRounds Número de rounds para o hash (padrão: 8)
   * @returns Hash da senha
   */
  static async generateHash(
    password: string,
    saltRounds: number = Hasher.SALT_ROUNDS,
  ): Promise<string> {
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compara uma senha em texto puro com um hash armazenado.
   * @param plainPassword Senha em texto puro
   * @param hashedPassword Hash armazenado
   * @returns 'true' se as senhas coincidirem, 'false' caso contrário
   */
  static async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
