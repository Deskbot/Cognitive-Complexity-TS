// function for file cost returns FileOutput
// score is sum of score for all child nodes
// inner is concat of all functions declared directly under every child node

// function for node cost (need depth, need node)
// score is sum of scores for all child nodes
// some child nodes are at the same depth as this node
// some child nodes are at a depth of 1 greater
// plus possible inherent cost
// plus possible nesting cost for current depth
// functions declared inside is the concat of:
    // all functions declared directly under a non function child node
    // all child nodes that are functions
// return score
// return all functions declared inside