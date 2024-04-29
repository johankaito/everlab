declare module '@rimiti/hl7-object-parser' {
  import { HL7File } from './types';
  const decode: (any, any) => HL7File;
}
