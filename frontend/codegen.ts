import type {CodegenConfig} from '@graphql-codegen/cli';

const config: CodegenConfig = {
    schema: 'http://localhost:8080/query',
    documents: ['src/**/*.{ts,tsx}'],
    generates: {
        './src/gql/graphql.ts': {
            plugins: [
                'typescript',
                'typescript-operations',
                'typescript-react-apollo',
            ],
            config: {
                withHooks: true,
                withHOC: false,
                withComponent: false,
                useTypeImports: true,
            },
        },
    },
    ignoreNoDocuments: true,
};

export default config;
