import { Container } from "@chakra-ui/react";
import { useCurrentUser } from "../../root";

export default function Index() {
  const user = useCurrentUser();
  return (
    <Container>
      <p>Hello, {user?.name} </p>
    </Container>
  );
}
