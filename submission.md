# Submission Details
## Database
* Decided to go with a NoSQL DB (Mongo) since the structure for 
the blocks and transactions are quite complex, and it will be less ideal
to use a SQL database such as MySQL

## Data Structure for Indexes
* After some googling, LSM and B-Trees are the more commonly used data
structures for indexes due to their time efficiency.
* I decided to go with LSM since it has a better write performance. 
Even though it is not as efficient when reading as compared to a B-Tree, 
we can improve this using a cache.
* Decided to go with [LevelJS](https://github.com/Level/level) to store
the indexes

## Procedure
### Adding block
1. Transactions are saved into Mongo
2. Transaction IDs are saved into `addressIndex` based on addresses
   1. `addressIndex` maps the address to a list of Transaction IDs
3. Block is saved into Mongo with corresponding Transaction IDs
4. Block ID is saved into `heightIndex` based on height
   1. `heightIndex` requires `lexicographic-integer-encoding` since 
   the keys are sorted in lexicographic order

### Reversing block
1. Fetch Block using hash
2. Remove corresponding Transactions from `addressIndex`
3. Remove Transactions from Mongo
4. Remove Block from `heightIndex`
5. Remove Block from Mongo

### Querying Data
#### /api/blocks
1. Query Mongo and return all blocks sorted in desc order of height

#### /api/blocks?maxHeight=
1. Get IDs of blocks from `heightIndex` with height lesser than or equals
max height
2. Use IDs to query Mongo and return result

#### /api/block/{hash}
1. Query Mongo using hash as ID and return result

#### /api/blocks/{height}/transactions
1. Get ID of block from `heightIndex`
2. Use ID to query Mongo and return Transactions of block

#### /api/blocks/address/{address}/transactions
1. Get Transaction IDs from `addressIndex`
2. Fetch from Mongo using IDs


PS. Please correct me if I stated something wrongly and let me know 
what can be done to improve. Thank you!
