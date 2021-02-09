import { Box, Flex, Link, Spacer, Text } from "@chakra-ui/react";
import { Form } from "@remix-run/react";
import { Link as RLink } from "react-router-dom";

export default function Header({ name }: { name: string }) {
  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      w="100%"
      mb={6}
      p={6}
    >
      <Text>
        Hello,{" "}
        <Link as={RLink} to="/account/">
          {name}
        </Link>
      </Text>
      <Spacer />
      <Box>
        <Form method="post" action="/users/logout">
          <button type="submit" className="u-pull-right">
            Logout
          </button>
        </Form>
      </Box>
    </Flex>
  );
}
