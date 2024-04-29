import React, { useState } from 'react';
import { FileUploader } from '../components/file-upload';
import { Center, Stack, Button, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const toast = useToast();
  const uploadFile = async () => {
    if (!file) {
      toast({
        title: 'Please choose a file to upload.',
        description: 'No file selected.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const result = await fetch('http://localhost:8000/upload?clear=true', {
        method: 'POST',
        body: formData,
      });

      const data = await result.json();
      console.log(data);
      toast({
        title: 'File uploaded!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/analyses');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Unable to upload file.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Stack textAlign="center" spacing="4">
      <FileUploader onFileSelected={(f) => setFile(f)} />
      <Center>
        <Button onClick={() => uploadFile()}>Upload file and see report</Button>
      </Center>
    </Stack>
  );
};
