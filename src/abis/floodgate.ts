export const ABI = [
  {
    "type": "impl",
    "name": "UpgradableImpl",
    "interface_name": "/opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::UpgradableTrait"
  },
  {
    "type": "interface",
    "name": "/opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::UpgradableTrait",
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
    "interface_name": "/opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::OwnableTrait"
  },
  {
    "type": "interface",
    "name": "/opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::OwnableTrait",
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
    "name": "FloodgateApplicationInterfaceImpl",
    "interface_name": "/opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::FloodgateApplicationInterfaceTrait"
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
    "type": "struct",
    "name": "/opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::InfluenceInventory",
    "members": [
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
      }
    ]
  },
  {
    "type": "struct",
    "name": "/opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::FloodgateService",
    "members": [
      {
        "name": "service_type",
        "type": "core::felt252"
      },
      {
        "name": "is_enabled",
        "type": "core::bool"
      },
      {
        "name": "sway_fee_per_action",
        "type": "core::integer::u64"
      },
      {
        "name": "sway_fee_per_second",
        "type": "core::integer::u64"
      }
    ]
  },
  {
    "type": "struct",
    "name": "core::array::Span::</opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::FloodgateService>",
    "members": [
      {
        "name": "snapshot",
        "type": "@core::array::Array::</opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::FloodgateService>"
      }
    ]
  },
  {
    "type": "struct",
    "name": "/opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::FloodgateAppServiceCrew",
    "members": [
      {
        "name": "crew_id",
        "type": "core::integer::u64"
      },
      {
        "name": "is_locked",
        "type": "core::bool"
      },
      {
        "name": "manager_address",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "is_automated_feeding_enabled",
        "type": "core::bool"
      },
      {
        "name": "default_feeding_inventory",
        "type": "/opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::InfluenceInventory"
      },
      {
        "name": "services",
        "type": "core::array::Span::</opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::FloodgateService>"
      }
    ]
  },
  {
    "type": "struct",
    "name": "core::array::Span::</opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::FloodgateAppServiceCrew>",
    "members": [
      {
        "name": "snapshot",
        "type": "@core::array::Array::</opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::FloodgateAppServiceCrew>"
      }
    ]
  },
  {
    "type": "interface",
    "name": "/opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::FloodgateApplicationInterfaceTrait",
    "items": [
      {
        "type": "function",
        "name": "get_crews",
        "inputs": [
          {
            "name": "manager_filter",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [
          {
            "type": "core::array::Span::</opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::FloodgateAppServiceCrew>"
          }
        ],
        "state_mutability": "view"
      }
    ]
  },
  {
    "type": "impl",
    "name": "FloodgateAdministrationImpl",
    "interface_name": "/opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::FloodgateAdministrationTrait"
  },
  {
    "type": "interface",
    "name": "/opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::FloodgateAdministrationTrait",
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
      },
      {
        "type": "function",
        "name": "set_influence_dispatcher_contract_address",
        "inputs": [
          {
            "name": "influence_dispatcher_contract_address",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "set_sway_contract_address",
        "inputs": [
          {
            "name": "sway_contract_address",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "set_registration_sway_fee",
        "inputs": [
          {
            "name": "sway_fee_per_registration",
            "type": "core::integer::u64"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "set_devteam_share",
        "inputs": [
          {
            "name": "share_in_thousands",
            "type": "core::integer::u16"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_devteam_share",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u16"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "set_devteam_address_one",
        "inputs": [
          {
            "name": "address",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "set_devteam_address_two",
        "inputs": [
          {
            "name": "address",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_devteam_address_one",
        "inputs": [],
        "outputs": [
          {
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_devteam_address_two",
        "inputs": [],
        "outputs": [
          {
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_devteam_balance_one",
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
        "name": "get_devteam_balance_two",
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
        "name": "withdraw_devteam_balance_one",
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
        "name": "withdraw_devteam_balance_two",
        "inputs": [
          {
            "name": "amount",
            "type": "core::integer::u64"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "impl",
    "name": "FloodgateManagementInterfaceImpl",
    "interface_name": "/opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::FloodgateManagementTrait"
  },
  {
    "type": "struct",
    "name": "/opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::FloodgateServiceCrew",
    "members": [
      {
        "name": "crew_id",
        "type": "core::integer::u64"
      },
      {
        "name": "is_registered",
        "type": "core::bool"
      },
      {
        "name": "is_locked",
        "type": "core::bool"
      },
      {
        "name": "manager_address",
        "type": "core::starknet::contract_address::ContractAddress"
      },
      {
        "name": "is_automated_feeding_enabled",
        "type": "core::bool"
      }
    ]
  },
  {
    "type": "interface",
    "name": "/opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::FloodgateManagementTrait",
    "items": [
      {
        "type": "function",
        "name": "register_crew",
        "inputs": [
          {
            "name": "service_crew_id",
            "type": "core::integer::u64"
          },
          {
            "name": "manager_address",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "register_crew_with_configuration",
        "inputs": [
          {
            "name": "service_crew_id",
            "type": "core::integer::u64"
          },
          {
            "name": "crew_configuration",
            "type": "/opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::FloodgateServiceCrew"
          },
          {
            "name": "default_feeding_inventory",
            "type": "/opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::InfluenceInventory"
          },
          {
            "name": "services",
            "type": "core::array::Array::</opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::FloodgateService>"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "unregister_crew",
        "inputs": [
          {
            "name": "service_crew_id",
            "type": "core::integer::u64"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "transfer_crew_management",
        "inputs": [
          {
            "name": "service_crew_id",
            "type": "core::integer::u64"
          },
          {
            "name": "new_manager",
            "type": "core::starknet::contract_address::ContractAddress"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "set_crew_locked_status",
        "inputs": [
          {
            "name": "service_crew_id",
            "type": "core::integer::u64"
          },
          {
            "name": "is_locked",
            "type": "core::bool"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "set_crew_feeding_configuration",
        "inputs": [
          {
            "name": "service_crew_id",
            "type": "core::integer::u64"
          },
          {
            "name": "is_automated_feeding_enabled",
            "type": "core::bool"
          },
          {
            "name": "default_feeding_inventory",
            "type": "/opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::InfluenceInventory"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "set_crew_services_configuration",
        "inputs": [
          {
            "name": "service_crew_id",
            "type": "core::integer::u64"
          },
          {
            "name": "services",
            "type": "core::array::Array::</opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::FloodgateService>"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "get_current_balance",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u128"
          }
        ],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "withdraw_balance",
        "inputs": [
          {
            "name": "amount",
            "type": "core::integer::u128"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "resupply_food",
        "inputs": [
          {
            "name": "service_crew_id",
            "type": "core::integer::u64"
          },
          {
            "name": "source_inventory",
            "type": "/opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::InfluenceInventory"
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
        "name": "resupply_food_from_default",
        "inputs": [
          {
            "name": "service_crew_id",
            "type": "core::integer::u64"
          },
          {
            "name": "food_kg",
            "type": "core::integer::u64"
          }
        ],
        "outputs": [],
        "state_mutability": "external"
      }
    ]
  },
  {
    "type": "impl",
    "name": "FloodgateUsageInterfaceImpl",
    "interface_name": "/opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::FloodgateUsageTrait"
  },
  {
    "type": "interface",
    "name": "/opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::FloodgateUsageTrait",
    "items": [
      {
        "type": "function",
        "name": "service_refuel_ship",
        "inputs": [
          {
            "name": "service_crew_id",
            "type": "core::integer::u64"
          },
          {
            "name": "source_inventory",
            "type": "/opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::InfluenceInventory"
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
      }
    ]
  },
  {
    "type": "constructor",
    "name": "constructor",
    "inputs": [
      {
        "name": "initial_owner",
        "type": "core::starknet::contract_address::ContractAddress"
      }
    ]
  },
  {
    "type": "event",
    "name": "/opt/app/api/upload/temp/c19f9feb93cd551c394335f1b007a1c1053819278893bf84e2d1ef9eef90857e/src::Floodgate::Event",
    "kind": "enum",
    "variants": []
  }
] as const;
