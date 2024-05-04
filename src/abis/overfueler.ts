export const ABI = [
  {
    "type": "impl",
    "name": "UpgradableImpl",
    "interface_name": "influenceoverfueler::UpgradableTrait"
  },
  {
    "type": "interface",
    "name": "influenceoverfueler::UpgradableTrait",
    "items": [
      {
        "type": "function",
        "name": "upgrade_class_hash",
        "inputs": [
          {
            "name": "new_class_hash",
            "type": "core::starknet::class_hash::ClassHash"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "impl",
    "name": "OwnableImpl",
    "interface_name": "influenceoverfueler::OwnableTrait"
  },
  {
    "type": "interface",
    "name": "influenceoverfueler::OwnableTrait",
    "items": [
      {
        "type": "function",
        "name": "transfer_ownership",
        "inputs": [
          {
            "name": "new_owner",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_owner",
        "inputs": [],
        "outputs": [
          {
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "type": "impl",
    "name": "LockableImpl",
    "interface_name": "influenceoverfueler::LockableTrait"
  },
  {
    "type": "enum",
    "name": "core::bool",
    "variants": [
      {
        "name": "False",
        "type": "()"
      },
      {
        "name": "True",
        "type": "()"
      }
    ]
  },
  {
    "type": "interface",
    "name": "influenceoverfueler::LockableTrait",
    "items": [
      {
        "type": "function",
        "name": "lock",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "unlock",
        "inputs": [],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "is_locked",
        "inputs": [],
        "outputs": [
          {
            "type": "core::bool"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "type": "impl",
    "name": "CrewHolderImpl",
    "interface_name": "influenceoverfueler::CrewHolderTrait"
  },
  {
    "type": "interface",
    "name": "influenceoverfueler::CrewHolderTrait",
    "items": [
      {
        "type": "function",
        "name": "set_crew_id",
        "inputs": [
          {
            "name": "new_crew_id",
            "type": "core::integer::u64"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_crew_id",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u64"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "refill_crew_rations",
        "inputs": [
          {
            "name": "inventory_type",
            "type": "core::integer::u64"
          },
          {
            "name": "inventory_id",
            "type": "core::integer::u64"
          },
          {
            "name": "inventory_slot",
            "type": "core::integer::u64"
          },
          {
            "name": "food_kg",
            "type": "core::integer::u64"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "refuel_ship",
        "inputs": [
          {
            "name": "inventory_type",
            "type": "core::integer::u64"
          },
          {
            "name": "inventory_id",
            "type": "core::integer::u64"
          },
          {
            "name": "inventory_slot",
            "type": "core::integer::u64"
          },
          {
            "name": "ship_id",
            "type": "core::integer::u64"
          },
          {
            "name": "fuel_kg",
            "type": "core::integer::u64"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "set_influence_dispatcher",
        "inputs": [
          {
            "name": "influence_dispatcher_address",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "impl",
    "name": "ChargeableServiceImpl",
    "interface_name": "influenceoverfueler::ChargeableServiceTrait"
  },
  {
    "type": "struct",
    "name": "core::integer::u256",
    "members": [
      {
        "name": "low",
        "type": "core::integer::u128"
      },
      {
        "name": "high",
        "type": "core::integer::u128"
      }
    ]
  },
  {
    "type": "interface",
    "name": "influenceoverfueler::ChargeableServiceTrait",
    "items": [
      {
        "type": "function",
        "name": "set_sway_address",
        "inputs": [
          {
            "name": "sway_address",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "set_sway_fee",
        "inputs": [
          {
            "name": "amount",
            "type": "core::integer::u64"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_sway_fee",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u64"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_current_sway_balance",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "withdraw_sway_balance",
        "inputs": [
          {
            "name": "amount",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "constructor",
    "name": "constructor",
    "inputs": [
      {
        "name": "init_owner",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "type": "event",
    "name": "influenceoverfueler::InfluenceOverfueler::Event",
    "kind": "enum",
    "variants": []
  }
] as const;
