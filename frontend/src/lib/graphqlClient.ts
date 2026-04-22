import {GraphQLClient} from "graphql-request";
import {getApiUrl} from "./api";

export const graphqlClient = new GraphQLClient(getApiUrl("/query"));
