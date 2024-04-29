import React, { useCallback, useEffect, useState } from 'react';
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom';
import {
  TableContainer,
  Button,
  Link as ChakraLink,
  Table,
  TableCaption,
  Thead,
  Tr,
  Th,
  Tbody,
  useToast,
  Td,
  Code,
  HStack,
  Text,
  Stack,
  Center,
  Box,
  Tfoot,
  Select,
  useColorModeValue,
} from '@chakra-ui/react';
import { Analyses as AnalysesType } from '../types';

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
};
export const Analyses = () => {
  const [analyses, setAnalyses] = useState<AnalysesType>();
  const [patientSSN, setPatientSSN] = useState<string | null>(null);
  const activePatientAnalyses = patientSSN && analyses?.[patientSSN];
  const bothRiskColor = useColorModeValue('pink', 'purple');
  const everlabRiskColor = useColorModeValue('beige', 'teal');
  const standardRiskBorderColor = useColorModeValue('black', 'white');
  const dashboardColor = useColorModeValue('black', 'beige');
  const toast = useToast();
  const navigate = useNavigate();

  const fetchAnalyses = useCallback(async () => {
    try {
      const result = await fetch('http://localhost:8000/analyses');
      setAnalyses((await result.json()) as AnalysesType);
    } catch (error) {
      toast({
        title: 'Error fetching results.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  const clearObservations = useCallback(async () => {
    try {
      await fetch('http://localhost:8000/clear-analyses');
      await fetchAnalyses();
      toast({
        title: 'Observations cleared.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error clearing analyses.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast, fetchAnalyses, navigate]);

  useEffect(() => {
    (async () => {
      await fetchAnalyses();
    })();
  }, [fetchAnalyses, toast]);

  return (
    <Stack textAlign="center" spacing="8">
      <Box>
        <Text>HIGH RISK CONDITIONS</Text>
        {Object.keys(analyses || {}).length === 0 && (
          <Code fontSize="sm" textColor="red" mt={2} p={2}>
            No analyses present. Please upload file in the{' '}
            <ChakraLink color={dashboardColor} as={ReactRouterLink} to={'/'}>
              Dashboard
            </ChakraLink>{' '}
            to begin.
          </Code>
        )}
      </Box>
      {!!analyses && (
        <Center>
          <Select
            placeholder="Patient"
            variant="outline"
            onChange={(e) => setPatientSSN(e.target.value)}
          >
            {Object.keys(analyses).map((ssn) => (
              <option value={ssn}>
                {analyses[ssn][0].pid.firstName} {analyses[ssn][0].pid.lastName}
              </option>
            ))}
          </Select>
        </Center>
      )}
      {!!patientSSN && !!activePatientAnalyses && (
        <>
          <HStack>
            <Text>Total:</Text>
            <Code fontSize="lg" fontWeight="bold">
              {activePatientAnalyses.length}
            </Code>
            <Text>Key:</Text>
            <Text bg={bothRiskColor} p={2}>
              Standard and Everlab Risk
            </Text>
            <Text bg={everlabRiskColor} p={2}>
              Everlab Risk
            </Text>
            <Text p={2} borderWidth={1} borderColor={standardRiskBorderColor}>
              Standard Risk
            </Text>
            <Button ml="auto" mr="4" onClick={clearObservations}>
              Clear Observations
            </Button>
          </HStack>
          <TableContainer fontSize="sm">
            <Table>
              <TableCaption></TableCaption>
              <Thead>
                <Tr>
                  <Th>Possible Condition</Th>
                  <Th>Diagnostic Groups (Diagnostic)</Th>
                  <Th>Observation</Th>
                  <Th>Standard Risk (Range)</Th>
                  <Th>Everlab Risk (Range)</Th>
                  <Th>Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {activePatientAnalyses
                  ?.sort(
                    (a, b) =>
                      (parseObservationDateTime(
                        b.observation.dateTime,
                      )?.getTime() || 0) -
                        (parseObservationDateTime(
                          a.observation.dateTime,
                        )?.getTime() || 0) ||
                      a.metric.diagnostic_groups.localeCompare(
                        b.metric.diagnostic_groups,
                      ),
                  )
                  .map((analysis) => {
                    return (
                      <Tr
                        bg={
                          analysis.isStandardRisk && analysis.isEverlabRisk
                            ? bothRiskColor
                            : analysis.isEverlabRisk
                            ? everlabRiskColor
                            : undefined
                        }
                      >
                        <Td>
                          {analysis.conditions?.join('') || 'None identified'}
                        </Td>
                        <Td>
                          {analysis.metric.diagnostic_groups} (
                          {analysis.metric.diagnostic})
                        </Td>
                        <Td>
                          {analysis.observation.value.type} -
                          {analysis.observation.value.text1}
                          {analysis.observation.value.text2}
                        </Td>
                        <Td>{analysis.isStandardRisk ? `True` : 'False'}</Td>
                        <Td>{analysis.isEverlabRisk ? 'True' : 'False'}</Td>
                        <Td>
                          {toLocale(
                            parseObservationDateTime(
                              analysis.observation.dateTime,
                            ),
                          )}
                        </Td>
                      </Tr>
                    );
                  })}
              </Tbody>
              <Tfoot>
                <Tr>
                  <Th>Possible Condition</Th>
                  <Th>Diagnostic Groups (Diagnostic)</Th>
                  <Th>Observation</Th>
                  <Th>Standard Risk</Th>
                  <Th>Everlab Risk</Th>
                  <Th>Date</Th>
                </Tr>
              </Tfoot>
            </Table>
          </TableContainer>
        </>
      )}
    </Stack>
  );
};

const parseObservationDateTime = (dateStr: string): Date | undefined => {
  if (!dateStr) return;
  if (dateStr.length !== 12) return;

  return new Date(
    parseInt(dateStr.substr(0, 4)),
    parseInt(dateStr.substr(4, 2)) - 1, // months start at 0
    parseInt(dateStr.substr(6, 2)),
    parseInt(dateStr.substr(8, 2)),
    parseInt(dateStr.substr(10, 2)),
  );
};

const toLocale = (date: Date | undefined): string => {
  if (!date) {
    return '';
  }
  return date.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);
};
