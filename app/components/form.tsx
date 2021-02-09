import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Spacer,
  VStack,
} from "@chakra-ui/react";
import { Form, usePendingFormSubmit } from "@remix-run/react";
import React from "react";

interface InputFieldI {
  name: string;
  label: string;
  type?: string;
  readOnly?: boolean;
  value?: string;
  defaultValue?: string;
}

export const InputField = ({
  name,
  label,
  type = "text",
  ...params
}: InputFieldI) => (
  <FormControl id={name}>
    <FormLabel>{label}</FormLabel>
    <Input type={type} name={name} {...params} />
  </FormControl>
);

interface ActiveFormI {
  action: string;
  label: string;
  error?: string;
  submitLabel?: string;
  children: JSX.Element | JSX.Element[];
  secondaryButton?: JSX.Element;
}

export function ActiveForm({
  action,
  label,
  error,
  submitLabel,
  secondaryButton,
  children,
}: ActiveFormI) {
  let pendingForm = usePendingFormSubmit();

  return (
    <Form method="post" action={action}>
      <VStack spacing="5">
        <FormStatus
          error={error}
          submiting={pendingForm?.method === "post"}
          submitLabel={submitLabel}
        />
        {children}
        <HStack marginTop="20px" width="100%">
          <Button type="submit" disabled={!!pendingForm}>
            {label}
          </Button>
          <Spacer />
          {secondaryButton}
        </HStack>
      </VStack>
    </Form>
  );
}

// Form Status Alert, with a spacer to maintain constant spacing when the alert is blank
interface FormStatusI {
  error?: string;
  submitLabel?: string;
  submiting: boolean;
}

const FormStatus = ({ error, submiting, submitLabel }: FormStatusI) => {
  if (submiting && submitLabel)
    return (
      <Alert status="info">
        <AlertIcon />
        {submitLabel}
      </Alert>
    );

  if (error)
    return (
      <Alert status="error">
        <AlertIcon /> {error}
      </Alert>
    );
  return <Box height="48px">&nbsp;</Box>;
};
