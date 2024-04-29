import React from 'react';
import { VStack, Center, Input, Text } from '@chakra-ui/react';

export const FileUploader = ({
  onFileSelected,
}: {
  onFileSelected: (f: File) => void;
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <VStack spacing="4">
      <Center>
        <Text>Upload HL7 file</Text>
      </Center>
      <Center>
        <Input
          id="file"
          type="file"
          pl="7vw"
          pt={{ base: '5', md: '1vw' }}
          h="8vh"
          w={{ base: '60vw', md: '28vw' }}
          onChange={handleFileChange}
        />
      </Center>
    </VStack>
  );
};
