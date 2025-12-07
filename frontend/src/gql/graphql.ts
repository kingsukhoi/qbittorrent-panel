import {gql} from '@apollo/client';
import {
    type LazyQueryHookOptions,
    type MutationHookOptions,
    type MutationResult,
    type QueryHookOptions,
    type QueryResult,
    skipToken,
    type SkipToken,
    type SuspenseQueryHookOptions,
    useLazyQuery,
    useMutation,
    useQuery,
    useSuspenseQuery
} from '@apollo/client/react';

// Type aliases for codegen compatibility with Apollo Client v4
// These types are exported but not used in your code - they exist for API completeness
type MutationFunction<TData = any, TVariables = any> = (options?: { variables?: TVariables }) => Promise<{
    data?: TData
}>;
type BaseMutationOptions<TData = any, TVariables = any> = {
    variables?: TVariables;
    optimisticResponse?: TData;
    refetchQueries?: any[];
    awaitRefetchQueries?: boolean;
    update?: (cache: any, result: { data?: TData }) => void;
};

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: { input: string; output: string; }
    String: { input: string; output: string; }
    Boolean: { input: boolean; output: boolean; }
    Int: { input: number; output: number; }
    Float: { input: number; output: number; }
    Int64: { input: any; output: any; }
    Upload: { input: any; output: any; }
};

export type Category = {
    __typename?: 'Category';
    Name: Scalars['String']['output'];
    Path: Scalars['String']['output'];
    Servers: Array<Scalars['String']['output']>;
};

export type CreateCategoryArgs = {
    Name: Scalars['String']['input'];
    Path: Scalars['String']['input'];
};

export type CreateCategoryResult = {
    __typename?: 'CreateCategoryResult';
    Success: Scalars['Boolean']['output'];
};

export type File = {
    __typename?: 'File';
    Availability: Scalars['Float']['output'];
    Index: Scalars['Int']['output'];
    IsSeed: Scalars['Boolean']['output'];
    Name: Scalars['String']['output'];
    PieceRange: Array<Scalars['Int']['output']>;
    Priority: Scalars['Int']['output'];
    Progress: Scalars['Float']['output'];
    SizeBytes: Scalars['Int64']['output'];
};

export type Mutation = {
    __typename?: 'Mutation';
    createCategory: CreateCategoryResult;
    uploadTorrent: UploadTorrentResult;
};


export type MutationCreateCategoryArgs = {
    args: CreateCategoryArgs;
};


export type MutationUploadTorrentArgs = {
    args: UploadTorrentArgs;
};

export type Query = {
    __typename?: 'Query';
    Categories: Array<Category>;
    Torrent: Array<Maybe<Torrent>>;
    Torrents: Array<Torrent>;
};


export type QueryTorrentArgs = {
    infoHashV1: Scalars['String']['input'];
};


export type QueryTorrentsArgs = {
    categories?: InputMaybe<Array<Scalars['String']['input']>>;
    servers?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Torrent = {
    __typename?: 'Torrent';
    Category: Scalars['String']['output'];
    Comment: Scalars['String']['output'];
    Files: Array<File>;
    InfoHashV1: Scalars['String']['output'];
    Name: Scalars['String']['output'];
    Ratio: Scalars['Float']['output'];
    RootPath: Scalars['String']['output'];
    SavePath: Scalars['String']['output'];
    Server: Scalars['String']['output'];
    SizeBytes: Scalars['Int64']['output'];
    Tracker: Scalars['String']['output'];
};

export type UploadTorrentArgs = {
    Category?: InputMaybe<Scalars['String']['input']>;
    File: Scalars['Upload']['input'];
};

export type UploadTorrentResult = {
    __typename?: 'UploadTorrentResult';
    Success: Scalars['Boolean']['output'];
};

export type GetTorrentsQueryVariables = Exact<{
    categories?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
    servers?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type GetTorrentsQuery = {
    __typename?: 'Query',
    Torrents: Array<{
        __typename?: 'Torrent',
        Server: string,
        Name: string,
        Category: string,
        Ratio: number,
        InfoHashV1: string,
        Comment: string,
        RootPath: string,
        SavePath: string,
        SizeBytes: any,
        Tracker: string,
        Files: Array<{
            __typename?: 'File',
            Availability: number,
            Index: number,
            IsSeed: boolean,
            Name: string,
            PieceRange: Array<number>,
            Priority: number,
            Progress: number,
            SizeBytes: any
        }>
    }>
};

export type GetCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCategoriesQuery = {
    __typename?: 'Query',
    Categories: Array<{ __typename?: 'Category', Name: string, Path: string, Servers: Array<string> }>
};

export type GetTorrentQueryVariables = Exact<{
    infoHashV1: Scalars['String']['input'];
}>;


export type GetTorrentQuery = {
    __typename?: 'Query',
    Torrent: Array<{
        __typename?: 'Torrent',
        Server: string,
        Name: string,
        Category: string,
        Ratio: number,
        InfoHashV1: string,
        Comment: string,
        RootPath: string,
        SavePath: string,
        SizeBytes: any,
        Tracker: string,
        Files: Array<{
            __typename?: 'File',
            Availability: number,
            Index: number,
            IsSeed: boolean,
            Name: string,
            PieceRange: Array<number>,
            Priority: number,
            Progress: number,
            SizeBytes: any
        }>
    } | null>
};

export type CreateCategoryMutationVariables = Exact<{
    args: CreateCategoryArgs;
}>;


export type CreateCategoryMutation = {
    __typename?: 'Mutation',
    createCategory: { __typename?: 'CreateCategoryResult', Success: boolean }
};

export type UploadTorrentMutationVariables = Exact<{
    args: UploadTorrentArgs;
}>;


export type UploadTorrentMutation = {
    __typename?: 'Mutation',
    uploadTorrent: { __typename?: 'UploadTorrentResult', Success: boolean }
};


export const GetTorrentsDocument = gql`
    query GetTorrents($categories: [String!], $servers: [String!]) {
  Torrents(categories: $categories, servers: $servers) {
    Server
    Name
    Category
    Ratio
    InfoHashV1
    Comment
    RootPath
    SavePath
    SizeBytes
    Tracker
    Files {
      Availability
      Index
      IsSeed
      Name
      PieceRange
      Priority
      Progress
      SizeBytes
    }
  }
}
    `;

/**
 * __useGetTorrentsQuery__
 *
 * To run a query within a React component, call `useGetTorrentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTorrentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTorrentsQuery({
 *   variables: {
 *      categories: // value for 'categories'
 *      servers: // value for 'servers'
 *   },
 * });
 */
export function useGetTorrentsQuery(baseOptions?: QueryHookOptions<GetTorrentsQuery, GetTorrentsQueryVariables>) {
    const options = {...defaultOptions, ...baseOptions}
    return useQuery<GetTorrentsQuery, GetTorrentsQueryVariables>(GetTorrentsDocument, options);
}

export function useGetTorrentsLazyQuery(baseOptions?: LazyQueryHookOptions<GetTorrentsQuery, GetTorrentsQueryVariables>) {
    const options = {...defaultOptions, ...baseOptions}
    return useLazyQuery<GetTorrentsQuery, GetTorrentsQueryVariables>(GetTorrentsDocument, options);
}

export function useGetTorrentsSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetTorrentsQuery, GetTorrentsQueryVariables>) {
    const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
    return useSuspenseQuery<GetTorrentsQuery, GetTorrentsQueryVariables>(GetTorrentsDocument, options);
}

export type GetTorrentsQueryHookResult = ReturnType<typeof useGetTorrentsQuery>;
export type GetTorrentsLazyQueryHookResult = ReturnType<typeof useGetTorrentsLazyQuery>;
export type GetTorrentsSuspenseQueryHookResult = ReturnType<typeof useGetTorrentsSuspenseQuery>;
export type GetTorrentsQueryResult = QueryResult<GetTorrentsQuery, GetTorrentsQueryVariables>;
export const GetCategoriesDocument = gql`
    query GetCategories {
  Categories {
    Name
    Path
    Servers
  }
}
    `;

/**
 * __useGetCategoriesQuery__
 *
 * To run a query within a React component, call `useGetCategoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCategoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCategoriesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCategoriesQuery(baseOptions?: QueryHookOptions<GetCategoriesQuery, GetCategoriesQueryVariables>) {
    const options = {...defaultOptions, ...baseOptions}
    return useQuery<GetCategoriesQuery, GetCategoriesQueryVariables>(GetCategoriesDocument, options);
}

export function useGetCategoriesLazyQuery(baseOptions?: LazyQueryHookOptions<GetCategoriesQuery, GetCategoriesQueryVariables>) {
    const options = {...defaultOptions, ...baseOptions}
    return useLazyQuery<GetCategoriesQuery, GetCategoriesQueryVariables>(GetCategoriesDocument, options);
}

export function useGetCategoriesSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetCategoriesQuery, GetCategoriesQueryVariables>) {
    const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
    return useSuspenseQuery<GetCategoriesQuery, GetCategoriesQueryVariables>(GetCategoriesDocument, options);
}

export type GetCategoriesQueryHookResult = ReturnType<typeof useGetCategoriesQuery>;
export type GetCategoriesLazyQueryHookResult = ReturnType<typeof useGetCategoriesLazyQuery>;
export type GetCategoriesSuspenseQueryHookResult = ReturnType<typeof useGetCategoriesSuspenseQuery>;
export type GetCategoriesQueryResult = QueryResult<GetCategoriesQuery, GetCategoriesQueryVariables>;
export const GetTorrentDocument = gql`
    query GetTorrent($infoHashV1: String!) {
  Torrent(infoHashV1: $infoHashV1) {
    Server
    Name
    Category
    Ratio
    InfoHashV1
    Comment
    RootPath
    SavePath
    SizeBytes
    Tracker
    Files {
      Availability
      Index
      IsSeed
      Name
      PieceRange
      Priority
      Progress
      SizeBytes
    }
  }
}
    `;

/**
 * __useGetTorrentQuery__
 *
 * To run a query within a React component, call `useGetTorrentQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTorrentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTorrentQuery({
 *   variables: {
 *      infoHashV1: // value for 'infoHashV1'
 *   },
 * });
 */
export function useGetTorrentQuery(baseOptions: QueryHookOptions<GetTorrentQuery, GetTorrentQueryVariables> & ({
    variables: GetTorrentQueryVariables;
    skip?: boolean;
} | { skip: boolean; })) {
    const options = {...defaultOptions, ...baseOptions}
    return useQuery<GetTorrentQuery, GetTorrentQueryVariables>(GetTorrentDocument, options);
}

export function useGetTorrentLazyQuery(baseOptions?: LazyQueryHookOptions<GetTorrentQuery, GetTorrentQueryVariables>) {
    const options = {...defaultOptions, ...baseOptions}
    return useLazyQuery<GetTorrentQuery, GetTorrentQueryVariables>(GetTorrentDocument, options);
}

export function useGetTorrentSuspenseQuery(baseOptions?: SkipToken | SuspenseQueryHookOptions<GetTorrentQuery, GetTorrentQueryVariables>) {
    const options = baseOptions === skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
    return useSuspenseQuery<GetTorrentQuery, GetTorrentQueryVariables>(GetTorrentDocument, options as any);
}

export type GetTorrentQueryHookResult = ReturnType<typeof useGetTorrentQuery>;
export type GetTorrentLazyQueryHookResult = ReturnType<typeof useGetTorrentLazyQuery>;
export type GetTorrentSuspenseQueryHookResult = ReturnType<typeof useGetTorrentSuspenseQuery>;
export type GetTorrentQueryResult = QueryResult<GetTorrentQuery, GetTorrentQueryVariables>;
export const CreateCategoryDocument = gql`
    mutation CreateCategory($args: CreateCategoryArgs!) {
  createCategory(args: $args) {
    Success
  }
}
    `;
export type CreateCategoryMutationFn = MutationFunction<CreateCategoryMutation, CreateCategoryMutationVariables>;

/**
 * __useCreateCategoryMutation__
 *
 * To run a mutation, you first call `useCreateCategoryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCategoryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCategoryMutation, { data, loading, error }] = useCreateCategoryMutation({
 *   variables: {
 *      args: // value for 'args'
 *   },
 * });
 */
export function useCreateCategoryMutation(baseOptions?: MutationHookOptions<CreateCategoryMutation, CreateCategoryMutationVariables>) {
    const options = {...defaultOptions, ...baseOptions}
    return useMutation<CreateCategoryMutation, CreateCategoryMutationVariables>(CreateCategoryDocument, options);
}

export type CreateCategoryMutationHookResult = ReturnType<typeof useCreateCategoryMutation>;
export type CreateCategoryMutationResult = MutationResult<CreateCategoryMutation>;
export type CreateCategoryMutationOptions = BaseMutationOptions<CreateCategoryMutation, CreateCategoryMutationVariables>;
export const UploadTorrentDocument = gql`
    mutation UploadTorrent($args: UploadTorrentArgs!) {
  uploadTorrent(args: $args) {
    Success
  }
}
    `;
export type UploadTorrentMutationFn = MutationFunction<UploadTorrentMutation, UploadTorrentMutationVariables>;

/**
 * __useUploadTorrentMutation__
 *
 * To run a mutation, you first call `useUploadTorrentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadTorrentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadTorrentMutation, { data, loading, error }] = useUploadTorrentMutation({
 *   variables: {
 *      args: // value for 'args'
 *   },
 * });
 */
export function useUploadTorrentMutation(baseOptions?: MutationHookOptions<UploadTorrentMutation, UploadTorrentMutationVariables>) {
    const options = {...defaultOptions, ...baseOptions}
    return useMutation<UploadTorrentMutation, UploadTorrentMutationVariables>(UploadTorrentDocument, options);
}

export type UploadTorrentMutationHookResult = ReturnType<typeof useUploadTorrentMutation>;
export type UploadTorrentMutationResult = MutationResult<UploadTorrentMutation>;
export type UploadTorrentMutationOptions = BaseMutationOptions<UploadTorrentMutation, UploadTorrentMutationVariables>;