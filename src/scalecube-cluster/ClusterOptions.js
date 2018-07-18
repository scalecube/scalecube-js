// @flow

// URI e.g. protocol://host:port/path?query#ancher
export type URI = string;

export interface ClusterOptions{
    addresses: URI[];
}