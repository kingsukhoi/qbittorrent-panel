import {ApolloClient, HttpLink, InMemoryCache} from "@apollo/client";
import {getApiUrl} from "./api";

const httpLink = new HttpLink({
    uri: getApiUrl("/query"),
});

export const apolloClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
});
