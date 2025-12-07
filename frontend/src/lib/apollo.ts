import {ApolloClient, HttpLink, InMemoryCache} from '@apollo/client';

const httpLink = new HttpLink({
    uri: 'http://localhost:8080/query', // Adjust this to your GraphQL endpoint
});

export const apolloClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
});
