import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { PatientRepository } from '../../clinical/domain/repositories/patient.repository';
import { AnamnesisRepository } from '../../clinical/domain/repositories/anamnesis.repository';
import { AnthropometricAssessmentRepository } from '../../clinical/domain/repositories/anthropometric-assessment.repository';

/**
 * Cria um conjunto de ferramentas para o assistente de IA acessar dados clínicos.
 * @param patientRepo Repositório de pacientes
 * @param anamnesisRepo Repositório de anamneses
 * @param assessmentRepo Repositório de avaliações antropométricas
 * @param nutritionistId ID do nutricionista (para segurança de multi-tenancy)
 * @param patientId ID do paciente alvo
 */
export function createClinicalTools(
  patientRepo: PatientRepository,
  anamnesisRepo: AnamnesisRepository,
  assessmentRepo: AnthropometricAssessmentRepository,
  nutritionistId: string,
  patientId: string,
) {
  const getPatientData = tool(
    async () => {
      const patient = await patientRepo.findOneById(patientId);
      if (!patient || patient.nutritionistId !== nutritionistId) {
        return 'Paciente não encontrado ou acesso negado.';
      }
      return JSON.stringify({
        name: patient.name,
        email: patient.email,
        birthDate: patient.birthDate,
        gender: patient.gender,
        phoneNumber: patient.phoneNumber,
        createdAt: patient.createdAt,
      });
    },
    {
      name: 'get_patient_data',
      description:
        'Retorna informações cadastrais básicas e demográficas do paciente atual.',
      schema: z.object({}),
    },
  );

  const getPatientAnamnesis = tool(
    async () => {
      // Verifica primeiro se o paciente pertence ao nutricionista
      const patient = await patientRepo.findOneById(patientId);
      if (!patient || patient.nutritionistId !== nutritionistId) {
        return 'Acesso negado aos dados deste paciente.';
      }

      const anamneses = await anamnesisRepo.findByPatient(patientId);
      if (!anamneses.length) {
        return 'Nenhuma anamnese encontrada para este paciente.';
      }
      return JSON.stringify(anamneses[0]); // Retorna a mais recente
    },
    {
      name: 'get_patient_anamnesis',
      description:
        'Retorna o histórico de saúde, objetivos, preferências alimentares e estilo de vida do paciente.',
      schema: z.object({}),
    },
  );

  const getPatientAssessments = tool(
    async () => {
      // Verifica primeiro se o paciente pertence ao nutricionista
      const patient = await patientRepo.findOneById(patientId);
      if (!patient || patient.nutritionistId !== nutritionistId) {
        return 'Acesso negado aos dados deste paciente.';
      }

      const assessments = await assessmentRepo.findByPatient(patientId);
      if (!assessments.length) {
        return 'Nenhuma avaliação antropométrica encontrada para este paciente.';
      }
      // Retorna as 3 últimas avaliações para ver a evolução
      return JSON.stringify(assessments.slice(0, 3));
    },
    {
      name: 'get_patient_assessments',
      description:
        'Retorna o histórico de medidas físicas (peso, altura, % gordura) do paciente.',
      schema: z.object({}),
    },
  );

  return [getPatientData, getPatientAnamnesis, getPatientAssessments];
}
