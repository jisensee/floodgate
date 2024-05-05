use starknet::ContractAddress;
use starknet::ClassHash;

#[starknet::interface]
pub trait IInfluenceDispatcherContract<T> {
    fn run_system(ref self: T, name: felt252, calldata: Array<felt252>) -> felt252;
}

#[starknet::interface]
pub trait ISwayContract<T> {
    fn balance_of(self: @T, account: ContractAddress) -> u256;
    fn transfer(ref self: T, recipient: ContractAddress, amount: u256) -> bool;
    fn transfer_from(ref self: T, sender: ContractAddress, recipient: ContractAddress, amount: u256) -> bool;
}

#[starknet::interface]
pub trait IInfluenceCrewsContract<T> {
    fn owner_of(self: @T, token_id: u256) -> ContractAddress;
}

#[starknet::interface]
trait UpgradableTrait<T>
{
    fn upgrade_class_hash(ref self: T, new_class_hash: ClassHash);
}

#[starknet::interface]
trait OwnableTrait<T>
{
    fn transfer_ownership(ref self: T, new_owner: ContractAddress);
    fn get_owner(self: @T) -> ContractAddress;
}

#[derive(Drop, Serde)]
struct ListLink {
    prev: u64,
    next: u64,
    is_defined: bool,
}

#[derive(Drop, Serde)]
struct FloodgateServiceCrew {
    crew_id: u64,
    is_registered: bool,
    is_locked: bool,
    manager_address: ContractAddress,
    is_automated_feeding_enabled: bool,
}

#[derive(Drop, Serde)]
struct FloodgateService {
    service_type: felt252,
    is_enabled: bool,
    sway_fee_per_action: u64,
    sway_fee_per_second: u64,
}

#[derive(Drop, Serde)]
struct FloodgateDevTeamBalances {
    one: u64,
    two: u64,
}

#[derive(Drop, Serde)]
struct FloodgateAppServiceCrew {
    crew_id: u64,
    is_locked: bool,
    manager_address: ContractAddress,
    is_automated_feeding_enabled: bool,
    default_feeding_inventory: InfluenceInventory,
    services: Span<FloodgateService>,
}

#[derive(Drop, Serde)]
struct InfluenceInventory {
    inventory_type: u64,
    inventory_id: u64,
    inventory_slot: u64,
}

#[derive(Drop, Serde)]
struct InfluenceInventoryItem {
    item_id: u64,
    item_quantity: u64,
}

#[starknet::interface]
trait FixScrewedDataTrait<T>
{
    fn reset_crew_list(ref self: T, start_id: u64, end_id: u64);
}

#[starknet::interface]
trait FloodgateApplicationInterfaceTrait<T>
{
    fn get_crew(self: @T, service_crew_id: u64) -> FloodgateAppServiceCrew;
    fn get_crews(self: @T, manager_filter: ContractAddress) -> Span<FloodgateAppServiceCrew>;
}

#[starknet::interface]
trait FloodgateAdministrationTrait<T>
{
    fn lock(ref self: T);
    fn unlock(ref self: T);
    fn is_locked(self: @T) -> bool;
    fn set_influence_dispatcher_contract_address(ref self: T, influence_dispatcher_contract_address: ContractAddress);
    fn set_sway_contract_address(ref self: T, sway_contract_address: ContractAddress);
    fn set_influence_crews_contract_address(ref self: T, influence_crews_contract_address: ContractAddress);
    fn set_registration_sway_fee(ref self: T, sway_fee_per_registration: u64);

    fn set_devteam_share(ref self: T, share_in_thousands: u16);
    fn get_devteam_share(self: @T) -> u16;
    fn set_devteam_address_one(ref self: T, address: ContractAddress);
    fn set_devteam_address_two(ref self: T, address: ContractAddress);
    fn get_devteam_address_one(self: @T) -> ContractAddress;
    fn get_devteam_address_two(self: @T) -> ContractAddress;
    fn get_devteam_balance_one(self: @T) -> u64;
    fn get_devteam_balance_two(self: @T) -> u64;
    fn withdraw_devteam_balance_one(ref self: T, amount: u64);
    fn withdraw_devteam_balance_two(ref self: T, amount: u64);
}

#[starknet::interface]
trait FloodgateManagementTrait<T>
{
    fn register_crew(ref self: T, service_crew_id: u64, manager_address: ContractAddress);
    fn register_crew_with_configuration(ref self: T, service_crew_id: u64, crew_configuration: FloodgateServiceCrew, default_feeding_inventory: InfluenceInventory, services: Array<FloodgateService>);
    fn unregister_crew(ref self: T, service_crew_id: u64);
    fn transfer_crew_management(ref self: T, service_crew_id: u64, new_manager: ContractAddress);

    fn set_crew_locked_status(ref self: T, service_crew_id: u64, is_locked: bool);
    fn set_crew_feeding_configuration(ref self: T, service_crew_id: u64, is_automated_feeding_enabled: bool, default_feeding_inventory: InfluenceInventory);
    fn set_crew_services_configuration(ref self: T, service_crew_id: u64, services: Array<FloodgateService>);

    fn get_current_balance(self: @T) -> u128;
    fn withdraw_balance(ref self: T, amount: u128);

    fn resupply_food(ref self: T, service_crew_id: u64, source_inventory: InfluenceInventory, food_kg: u64);
    fn resupply_food_from_default(ref self: T, service_crew_id: u64, food_kg: u64);
}

#[starknet::interface]
trait FloodgateUsageTrait<T>
{
    fn service_refuel_ship(ref self: T, service_crew_id: u64, source_inventory: InfluenceInventory, ship_id: u64, fuel_kg: u64);
    fn service_transfer_goods (ref self: T, service_crew_id: u64, destination_inventory: InfluenceInventory, transfers: Array<(InfluenceInventory, Array<InfluenceInventoryItem>)>);
}

#[starknet::contract]
mod Floodgate
{
    use super::{ ContractAddress, ClassHash };
    use starknet::{ SyscallResultTrait, syscalls };
    use starknet::{ get_caller_address, get_contract_address };
    use starknet::contract_address_to_felt252;

    use starknet::storage_access::StorePacking;
    const TWO_POW_64: u256 =  0x10000000000000000;
    const TWO_POW_65: u256 =  TWO_POW_64 * 2;
    const TWO_POW_66: u256 =  TWO_POW_65 * 2;
    const TWO_POW_128: u256 = TWO_POW_64 * TWO_POW_64;
    const MASK_1: u256 =      0x1;
    const MASK_8: u256 =     TWO_POW_64 / 8 - 1;
    const MASK_64: u256 =     TWO_POW_64 - 1;

    use super::ListLink;

    use super::{ IInfluenceDispatcherContractDispatcher, IInfluenceDispatcherContractDispatcherTrait };
    use super::{ ISwayContractDispatcher, ISwayContractDispatcherTrait };
    use super::{ IInfluenceCrewsContractDispatcher, IInfluenceCrewsContractDispatcherTrait };

    use super::FloodgateDevTeamBalances;

    use super::FloodgateService;
    use super::{ FloodgateServiceCrew, FloodgateAppServiceCrew };
    use super::{ InfluenceInventory, InfluenceInventoryItem };

    #[storage]
    struct Storage {
        contract_owner: ContractAddress,
        contract_is_locked: bool,

        devteam_share: u16,
        devteam_address_one: ContractAddress,
        devteam_address_two: ContractAddress,
        devteam_balances: FloodgateDevTeamBalances,

        influence_dispatcher_contract_address: ContractAddress,
        sway_contract_address: ContractAddress,
        influence_crews_contract_address: ContractAddress,

        sway_fee_per_registration: u64,

        service_crew_ids: LegacyMap<u64, ListLink>,
        service_crew_ids_anchor: u64,
        service_crews: LegacyMap<u64, FloodgateServiceCrew>,
        service_crew_feeding_inventories: LegacyMap<u64, InfluenceInventory>,
        services: LegacyMap<(u64, felt252), FloodgateService>,

        manager_balances: LegacyMap<ContractAddress, u128>,
    }

    impl ListLinkPackable of StorePacking<ListLink, felt252>
    {
        fn pack(value: ListLink) -> felt252 {
            let packed: u256 =
                value.prev.into()
                + value.next.into() * TWO_POW_64
                + if value.is_defined { TWO_POW_128 } else { 0 };

            packed.try_into().unwrap()
        }

        fn unpack(value: felt252) -> ListLink {
            let packed: u256 = value.into();
            ListLink {
                prev:       (packed & MASK_64).try_into().unwrap(),
                next:       ((packed / TWO_POW_64) & MASK_64).try_into().unwrap(),
                is_defined:   ((packed / TWO_POW_128) & MASK_1).is_non_zero(),
            }
        }
    }

    impl FloodgateDevTeamBalancesPackable of StorePacking<FloodgateDevTeamBalances, felt252>
    {
        fn pack(value: FloodgateDevTeamBalances) -> felt252 {
            let packed: u256 =
                value.one.into()
                + value.two.into() * TWO_POW_64;

            packed.try_into().unwrap()
        }

        fn unpack(value: felt252) -> FloodgateDevTeamBalances {
            let packed: u256 = value.into();
            FloodgateDevTeamBalances {
                one:       (packed & MASK_64).try_into().unwrap(),
                two:       ((packed / TWO_POW_64) & MASK_64).try_into().unwrap(),
            }
        }
    }

    impl FloodgateServiceCrewPackable of StorePacking<FloodgateServiceCrew, (felt252, ContractAddress)>
    {
        fn pack(value: FloodgateServiceCrew) -> (felt252, ContractAddress) {
            let packed: u256 =
                value.crew_id.into()
                + if value.is_registered { TWO_POW_64 } else { 0 }
                + if value.is_locked { TWO_POW_65 } else { 0 }
                + if value.is_automated_feeding_enabled { TWO_POW_66 } else { 0 };

            (packed.try_into().unwrap(), value.manager_address)
        }

        fn unpack(value: (felt252, ContractAddress)) -> FloodgateServiceCrew {
            let (p, manager_address) = value;
            let packed: u256 = p.into();
            FloodgateServiceCrew {
                crew_id:            (packed & MASK_64).try_into().unwrap(),
                is_registered:      ((packed / TWO_POW_64) & MASK_1).is_non_zero(),
                is_locked:          ((packed / TWO_POW_65) & MASK_1).is_non_zero(),
                manager_address,
                is_automated_feeding_enabled: ((packed / TWO_POW_66) & MASK_1).is_non_zero(),
            }
        }
    }
    
    impl FloodgateServicePackable of StorePacking<FloodgateService, (felt252, felt252)>
    {
        fn pack(value: FloodgateService) -> (felt252, felt252) {
            let packed: u256 =
                value.sway_fee_per_action.into()
                + value.sway_fee_per_second.into() * TWO_POW_64
                + if value.is_enabled { TWO_POW_128 } else { 0 };

            (value.service_type, packed.try_into().unwrap())
        }

        fn unpack(value: (felt252, felt252)) -> FloodgateService {
            let (service_type, p) = value;
            let packed: u256 = p.into();
            
            FloodgateService {
                service_type,
                is_enabled:             ((packed / TWO_POW_128) & MASK_1).is_non_zero(),
                sway_fee_per_action:    (packed & MASK_64).try_into().unwrap(),
                sway_fee_per_second:    ((packed / TWO_POW_64) & MASK_64).try_into().unwrap(),
            }
        }
    }

    impl InfluenceInventoryPackable of StorePacking<InfluenceInventory, felt252>
    {
        fn pack(value: InfluenceInventory) -> felt252 {
            let packed: u256 =
                value.inventory_type.into()
                + value.inventory_id.into() * TWO_POW_64
                + value.inventory_slot.into() * TWO_POW_128;

            packed.try_into().unwrap()
        }

        fn unpack(value: felt252) -> InfluenceInventory {
            let packed: u256 = value.into();
            InfluenceInventory {
                inventory_type: (packed & MASK_64).try_into().unwrap(),
                inventory_id:   ((packed / TWO_POW_64) & MASK_64).try_into().unwrap(),
                inventory_slot: ((packed / TWO_POW_128) & MASK_64).try_into().unwrap(),
            }
        }
    }

    impl InfluenceInventoryItemPackable of StorePacking<InfluenceInventoryItem, felt252>
    {
        fn pack(value: InfluenceInventoryItem) -> felt252 {
            let packed: u256 =
                value.item_id.into()
                + value.item_quantity.into() * TWO_POW_64;

            packed.try_into().unwrap()
        }

        fn unpack(value: felt252) -> InfluenceInventoryItem {
            let packed: u256 = value.into();
            InfluenceInventoryItem {
                item_id:        (packed & MASK_64).try_into().unwrap(),
                item_quantity:  ((packed / TWO_POW_64) & MASK_64).try_into().unwrap(),
            }
        }
    }

    #[constructor]
    fn constructor(ref self: ContractState, initial_owner: ContractAddress) {
        self.contract_is_locked.write(true);
        self.contract_owner.write(initial_owner);
        self.devteam_address_one.write(initial_owner);
        self.devteam_address_two.write(initial_owner);
    }

    #[abi(embed_v0)]
    impl UpgradableImpl of super::UpgradableTrait<ContractState>
    {
        fn upgrade_class_hash(ref self: ContractState, new_class_hash: ClassHash) {
            self.only_owner();
            assert(new_class_hash.is_non_zero(), 'Class hash is zero');
            let mut _res = syscalls::replace_class_syscall(new_class_hash).unwrap_syscall();
        }
    }

    #[abi(embed_v0)]
    impl OwnableImpl of super::OwnableTrait<ContractState>
    {
        fn transfer_ownership(ref self: ContractState, new_owner: ContractAddress) {
            self.only_owner();
            self.contract_owner.write(new_owner);
        }

        fn get_owner(self: @ContractState) -> ContractAddress {
            self.contract_owner.read()
        }
    }

    #[abi(embed_v0)]
    impl FixScrewedDataImpl of super::FixScrewedDataTrait<ContractState>
    {
        fn reset_crew_list(ref self: ContractState, start_id: u64, end_id: u64) {
            self.only_owner();
            let mut id: u64 = start_id;
            let null_address: ContractAddress = self.service_crews.read(0).manager_address;

            loop {
                if id >= end_id { break; }

                if self.service_crew_ids.read(id).is_defined {
                    self.service_crew_ids.write(id, ListLink { is_defined: false, prev: 0, next: 0 });
                }
                if self.service_crews.read(id).crew_id.is_non_zero() || self.service_crews.read(id).is_registered {
                    self.service_crews.write(id, FloodgateServiceCrew { crew_id: 0, is_registered: false, is_locked: false, manager_address: null_address, is_automated_feeding_enabled: false});
                }

                id += 1;
            };

            self.service_crew_ids_anchor.write(0);
        }
    }

    #[abi(embed_v0)]
    impl FloodgateApplicationInterfaceImpl of super::FloodgateApplicationInterfaceTrait<ContractState>
    {
        fn get_crew(self: @ContractState, service_crew_id: u64) -> FloodgateAppServiceCrew {
            self.only_unlocked();
            self.only_registered_crew(service_crew_id);
            
            self.get_crew_internal(service_crew_id)
        }

        fn get_crews(self: @ContractState, manager_filter: ContractAddress) -> Span<FloodgateAppServiceCrew> {
            self.only_unlocked();
            
            let get_all_crews: bool = manager_filter.is_zero();
            let mut a: Array<FloodgateAppServiceCrew> = ArrayTrait::new();

            let mut curr_id: u64 = self.service_crew_ids_anchor.read();
            loop {
                if curr_id.is_zero() { break; }

                if get_all_crews || self.service_crews.read(curr_id).manager_address == manager_filter {
                    a.append(self.get_crew_internal(curr_id));
                }

                curr_id = self.service_crew_ids.read(curr_id).next;
            };

            a.span()
        }
    }

    #[abi(embed_v0)]
    impl FloodgateAdministrationImpl of super::FloodgateAdministrationTrait<ContractState>
    {
        fn lock(ref self: ContractState) {
            self.only_owner();
            self.contract_is_locked.write(true);
        }

        fn unlock(ref self: ContractState) {
            self.only_owner();
            self.contract_is_locked.write(false);
        }

        fn is_locked(self: @ContractState) -> bool {
            self.contract_is_locked.read()
        }
        
        fn set_influence_dispatcher_contract_address(ref self: ContractState, influence_dispatcher_contract_address: ContractAddress) {
            self.only_owner();
            self.influence_dispatcher_contract_address.write(influence_dispatcher_contract_address);
        }
		
		fn set_sway_contract_address(ref self: ContractState, sway_contract_address: ContractAddress) {
            self.only_owner();
            self.sway_contract_address.write(sway_contract_address);
        }
		
		fn set_influence_crews_contract_address(ref self: ContractState, influence_crews_contract_address: ContractAddress) {
            self.only_owner();
            self.influence_crews_contract_address.write(influence_crews_contract_address);
        }
        
        fn set_registration_sway_fee(ref self: ContractState, sway_fee_per_registration: u64) {
            self.only_owner();
            assert(sway_fee_per_registration >= 0, 'Fee is negative');
            self.sway_fee_per_registration.write(sway_fee_per_registration);
        }
        
        fn set_devteam_share(ref self: ContractState, share_in_thousands: u16) {
            self.only_owner();
            self.devteam_share.write(share_in_thousands);
        }

        fn get_devteam_share(self: @ContractState) -> u16 {
            self.devteam_share.read()
        }
        
        fn set_devteam_address_one(ref self: ContractState, address: ContractAddress) {
            assert(get_caller_address() == self.devteam_address_one.read(), 'Caller is not devteam_one');
            self.devteam_address_one.write(address);
        }
        
        fn set_devteam_address_two(ref self: ContractState, address: ContractAddress) {
            assert(get_caller_address() == self.devteam_address_two.read(), 'Caller is not devteam_two');
            self.devteam_address_two.write(address);
        }
        
        fn get_devteam_address_one(self: @ContractState) -> ContractAddress {
            self.devteam_address_one.read()
        }

        fn get_devteam_address_two(self: @ContractState) -> ContractAddress {
            self.devteam_address_two.read()
        }

        fn get_devteam_balance_one(self: @ContractState) -> u64 {
            self.devteam_balances.read().one
        }

        fn get_devteam_balance_two(self: @ContractState) -> u64 {
            self.devteam_balances.read().two
        }

        fn withdraw_devteam_balance_one(ref self: ContractState, amount: u64) {
            assert(get_caller_address() == self.devteam_address_one.read(), 'Caller is not devteam_one');
            ISwayContractDispatcher { contract_address: self.sway_contract_address.read() }.transfer(get_caller_address(), amount.into());
        }

        fn withdraw_devteam_balance_two(ref self: ContractState, amount: u64) {
            assert(get_caller_address() == self.devteam_address_two.read(), 'Caller is not devteam_one');
            ISwayContractDispatcher { contract_address: self.sway_contract_address.read() }.transfer(get_caller_address(), amount.into());
        }
    }

    #[abi(embed_v0)]
    impl FloodgateManagementInterfaceImpl of super::FloodgateManagementTrait<ContractState>
    {
        fn register_crew(ref self: ContractState, service_crew_id: u64, manager_address: ContractAddress) {
            self.only_unlocked();
            self.only_influence_crew_token_owner(service_crew_id.into());

            self.add_service_crew_id(service_crew_id);
            self.service_crews.write(service_crew_id, FloodgateServiceCrew {
                crew_id: service_crew_id,
                is_registered: true,
                is_locked: true,
                manager_address: manager_address,
                is_automated_feeding_enabled: false,
            });

            self.handle_registration_fee();
        }

        fn register_crew_with_configuration(ref self: ContractState, service_crew_id: u64, crew_configuration: FloodgateServiceCrew, default_feeding_inventory: InfluenceInventory, services: Array<FloodgateService>) {
            self.only_unlocked();
            self.only_influence_crew_token_owner(service_crew_id.into());
            assert(service_crew_id == crew_configuration.crew_id, 'Crew ids do not match');

            let is_automated_feeding_enabled = crew_configuration.is_automated_feeding_enabled;
            self.add_service_crew_id(service_crew_id);
            self.service_crews.write(service_crew_id, FloodgateServiceCrew {
                crew_id: service_crew_id,
                is_registered: true,
                is_locked: crew_configuration.is_locked,
                manager_address: crew_configuration.manager_address,
                is_automated_feeding_enabled: crew_configuration.is_automated_feeding_enabled
            });
            self.set_crew_feeding_configuration_internal(service_crew_id, is_automated_feeding_enabled, default_feeding_inventory);
            self.set_crew_services_configuration_internal(service_crew_id, services);

            self.handle_registration_fee();
        }
        
        fn unregister_crew(ref self: ContractState, service_crew_id: u64) {
            self.only_unlocked();
            assert(get_caller_address() == self.get_influence_crew_token_owner(service_crew_id.into()) || get_caller_address() == self.service_crews.read(service_crew_id).manager_address, 'Not crew owner nor manager');

            self.remove_crew_id(service_crew_id);

            let mut c = self.service_crews.read(service_crew_id);
            c.is_registered = false;
            self.service_crews.write(service_crew_id, c);
        }
        
        fn transfer_crew_management(ref self: ContractState, service_crew_id: u64, new_manager: ContractAddress) {
            self.only_unlocked();
            self.only_manager(service_crew_id);
            let mut c = self.service_crews.read(service_crew_id);
            c.manager_address = new_manager;
            self.service_crews.write(service_crew_id, c);
        }

        fn set_crew_locked_status(ref self: ContractState, service_crew_id: u64, is_locked: bool) {
            self.only_unlocked();
            self.only_manager(service_crew_id);
            let mut c = self.service_crews.read(service_crew_id);
            c.is_locked = is_locked;
            self.service_crews.write(service_crew_id, c);
        }

        fn set_crew_feeding_configuration(ref self: ContractState, service_crew_id: u64, is_automated_feeding_enabled: bool, default_feeding_inventory: InfluenceInventory) {
            self.only_unlocked();
            self.only_manager(service_crew_id);
            self.set_crew_feeding_configuration_internal(service_crew_id, is_automated_feeding_enabled, default_feeding_inventory);
        }

        fn set_crew_services_configuration(ref self: ContractState, service_crew_id: u64, services: Array<FloodgateService>) {
            self.only_unlocked();
            self.only_manager(service_crew_id);
            self.set_crew_services_configuration_internal(service_crew_id, services);
        }

        fn get_current_balance(self: @ContractState) -> u128 {
            self.manager_balances.read(get_caller_address())
        }

        fn withdraw_balance(ref self: ContractState, amount: u128) {
            let address: ContractAddress = get_caller_address();
            let balance: u128 = self.manager_balances.read(address);

            assert(balance >= amount, 'Insufficient balance');

            self.manager_balances.write(address, balance - amount);
            ISwayContractDispatcher { contract_address: self.sway_contract_address.read() }.transfer(address, amount.into());
        }
        
        fn resupply_food(ref self: ContractState, service_crew_id: u64, source_inventory: InfluenceInventory, food_kg: u64) {
            self.only_unlocked();
            self.only_manager(service_crew_id);
            self.resupply_food_internal(service_crew_id, source_inventory, food_kg);
        }

        fn resupply_food_from_default(ref self: ContractState, service_crew_id: u64, food_kg: u64) {
            self.only_unlocked();
            self.only_manager(service_crew_id);
            self.resupply_food_internal(service_crew_id, self.service_crew_feeding_inventories.read(service_crew_id), food_kg);
        }
    }

    #[abi(embed_v0)]
    impl FloodgateUsageInterfaceImpl of super::FloodgateUsageTrait<ContractState>
    {
        fn service_refuel_ship(ref self: ContractState, service_crew_id: u64, source_inventory: InfluenceInventory, ship_id: u64, fuel_kg: u64) {
            let service_code: felt252 = 'RefuelShip';
            self.only_enabled_service(service_crew_id, service_code);
            
            let mut call_data: Array<felt252> = ArrayTrait::new();

            // source inventory
            call_data.append(source_inventory.inventory_type.into());
            call_data.append(source_inventory.inventory_id.into());
            call_data.append(source_inventory.inventory_slot.into());
            
            // propellant
            call_data.append(1);
            call_data.append(170);
            call_data.append(fuel_kg.into());

            // destination inventory
            call_data.append(6);
            call_data.append(ship_id.into());
            call_data.append(1);

            // caller crew
            call_data.append(1);
            call_data.append(service_crew_id.into());

            IInfluenceDispatcherContractDispatcher { contract_address: self.influence_dispatcher_contract_address.read() }.run_system('SendDelivery', call_data);

            self.handle_service_fee(service_crew_id, service_code, 0);
        }

        fn service_transfer_goods (ref self: ContractState, service_crew_id: u64, destination_inventory: InfluenceInventory, transfers: Array<(InfluenceInventory, Array<InfluenceInventoryItem>)>) {
            let service_code: felt252 = 'TransferGoods';
            self.only_enabled_service(service_crew_id, service_code);

            let mut a = transfers;
            while let Option::Some((source_inventory, items)) = a.pop_front() {
            
                // protect default food inventory
                if self.service_crews.read(service_crew_id).is_automated_feeding_enabled {
                    let f: InfluenceInventory = self.service_crew_feeding_inventories.read(service_crew_id);
                    assert(source_inventory.inventory_type != f.inventory_type || source_inventory.inventory_id != f.inventory_id || source_inventory.inventory_slot != f.inventory_slot, 'Transfer from feeding inventory');
                }

                let mut call_data: Array<felt252> = ArrayTrait::new();
                
                // source inventory
                call_data.append(source_inventory.inventory_type.into());
                call_data.append(source_inventory.inventory_id.into());
                call_data.append(source_inventory.inventory_slot.into());

                // items
                let mut i = items;
                while let Option::Some(item) = i.pop_front() {    
                    call_data.append(item.item_id.into());
                    call_data.append(item.item_quantity.into());
                };

                // destination inventory
                call_data.append(destination_inventory.inventory_type.into());
                call_data.append(destination_inventory.inventory_id.into());
                call_data.append(destination_inventory.inventory_slot.into());

                // caller crew
                call_data.append(1);
                call_data.append(service_crew_id.into());

                IInfluenceDispatcherContractDispatcher { contract_address: self.influence_dispatcher_contract_address.read() }.run_system('SendDelivery', call_data);
            };

            self.handle_service_fee(service_crew_id, service_code, 0);
        }
    }

    #[generate_trait]
    impl PrivateMethods of PrivateMethodsTrait
    {
        fn only_owner(self: @ContractState) {
            assert(get_caller_address() == self.contract_owner.read(), 'Caller is not the owner');
        }

        fn only_unlocked(self: @ContractState) {
            assert(self.contract_is_locked.read() == false, 'Floodgate is locked');
        }

        fn only_manager(self: @ContractState, crew_id: u64) {
            self.only_registered_crew(crew_id);
            assert(get_caller_address() == self.service_crews.read(crew_id).manager_address, 'Caller is not the manager');
        }

        fn only_registered_crew(self: @ContractState, crew_id: u64) {
            assert(self.service_crews.read(crew_id).is_registered, 'Crew is not registered');
        }

        fn only_unlocked_crew(self: @ContractState, crew_id: u64) {
            self.only_registered_crew(crew_id);
            assert(self.service_crews.read(crew_id).is_locked == false, 'Crew is locked');
        }

        fn only_enabled_service(self: @ContractState, crew_id: u64, service_type: felt252) {
            self.only_unlocked_crew(crew_id);
            assert(self.services.read((crew_id, service_type)).is_enabled, 'Service is not enabled');
        }

        fn get_influence_crew_token_owner(self: @ContractState, influence_crew_token_id: u256) -> ContractAddress {
            IInfluenceCrewsContractDispatcher { contract_address: self.influence_crews_contract_address.read() }.owner_of(influence_crew_token_id)
        }

        fn only_influence_crew_token_owner(self: @ContractState, influence_crew_token_id: u256) {
            assert(get_caller_address() == self.get_influence_crew_token_owner(influence_crew_token_id), 'Caller is not the crew owner');
        }

        fn handle_registration_fee(ref self: ContractState) {
            let fee: u64 = self.sway_fee_per_registration.read();
            if fee > 0 {
                ISwayContractDispatcher { contract_address: self.sway_contract_address.read() }.transfer_from(get_caller_address(), get_contract_address(), fee.into());

                let half_fee: u64 = fee / 2;
                let mut balances: FloodgateDevTeamBalances = self.devteam_balances.read();
                balances.one += half_fee;
                balances.two += half_fee;
                self.devteam_balances.write(balances);
            }
        }

        fn handle_service_fee(ref self: ContractState, service_crew_id: u64, service_type: felt252, busy_duration: u64) {
            let service = self.services.read((service_crew_id, service_type));
            let fee: u64 = service.sway_fee_per_action + busy_duration * service.sway_fee_per_second;

            if fee > 0 {
                ISwayContractDispatcher { contract_address: self.sway_contract_address.read() }.transfer_from(get_caller_address(), get_contract_address(), fee.into());

                let half_team_share: u64 = fee * self.devteam_share.read().into() / 2000;

                let manager_address: ContractAddress = self.service_crews.read(service_crew_id).manager_address;
                let old_balance = self.manager_balances.read(manager_address);
                self.manager_balances.write(manager_address, old_balance + (fee - 2 * half_team_share).into());
                
                let mut team_balances: FloodgateDevTeamBalances = self.devteam_balances.read();
                team_balances.one += half_team_share;
                team_balances.two += half_team_share;
                self.devteam_balances.write(team_balances);
            }
        }

        fn add_service_crew_id(ref self: ContractState, crew_id: u64) {
            if self.service_crew_ids.read(self.service_crew_ids_anchor.read()).is_defined == false { // empty list
                self.service_crew_ids.write(crew_id, ListLink { prev: 0, next: 0, is_defined: true });
                self.service_crew_ids_anchor.write(crew_id);
            }
            else if self.service_crew_ids.read(crew_id).is_defined == false {  // new key, add to front
                let service_crew_ids_anchor = self.service_crew_ids_anchor.read();
                let mut first_link = self.service_crew_ids.read(service_crew_ids_anchor);
                first_link.prev = crew_id;
                self.service_crew_ids.write(service_crew_ids_anchor, first_link);
                self.service_crew_ids.write(crew_id, ListLink { prev: 0, next: service_crew_ids_anchor, is_defined: true });
                self.service_crew_ids_anchor.write(crew_id);
            }
        }

        fn remove_crew_id(ref self: ContractState, crew_id: u64) {
            let link = self.service_crew_ids.read(crew_id);
            assert(link.is_defined, 'Key does not exist');

            if link.next.is_zero() {  // removing last item
                let mut prev_link = self.service_crew_ids.read(link.prev);
                prev_link.next = 0;
                self.service_crew_ids.write(link.prev, prev_link);              
            }
            else if link.prev.is_zero() {  // removing first item
                let mut next_link = self.service_crew_ids.read(link.next);
                next_link.prev = 0;
                self.service_crew_ids.write(link.next, next_link);
                self.service_crew_ids_anchor.write(link.next);
            }
            else {
                let mut prev_link = self.service_crew_ids.read(link.prev);
                let mut next_link = self.service_crew_ids.read(link.next);
                prev_link.next = link.next;
                next_link.prev = link.prev;
                self.service_crew_ids.write(link.prev, prev_link);
                self.service_crew_ids.write(link.next, next_link);
            }
            
            self.service_crew_ids.write(crew_id, ListLink { prev: 0, next: 0, is_defined: false });
        }

        fn set_crew_feeding_configuration_internal(ref self: ContractState, service_crew_id: u64, is_automated_feeding_enabled: bool, default_feeding_inventory: InfluenceInventory) {
            let mut c = self.service_crews.read(service_crew_id);
            c.is_automated_feeding_enabled = is_automated_feeding_enabled;
            self.service_crews.write(service_crew_id, c);
            self.service_crew_feeding_inventories.write(service_crew_id, default_feeding_inventory);
        }

        fn set_crew_services_configuration_internal(ref self: ContractState, service_crew_id: u64, services: Array<FloodgateService>)
        {
            let mut a = services;
            while let Option::Some(service) = a.pop_front() {
                assert(service.sway_fee_per_action >= 0, 'Fee is negative');
                assert(service.sway_fee_per_second >= 0, 'Fee is negative');
                self.services.write((service_crew_id, service.service_type), service);
            }
        }

        fn get_crew_internal(self: @ContractState, service_crew_id: u64) -> FloodgateAppServiceCrew {
            let c: FloodgateServiceCrew = self.service_crews.read(service_crew_id);
            let mut s: Array<FloodgateService> = ArrayTrait::new();

            let mut serv = self.services.read((service_crew_id, 'RefuelShip'));
            if serv.service_type.is_non_zero() { s.append(serv) };
            serv = self.services.read((service_crew_id, 'TransferGoods'));
            if serv.service_type.is_non_zero() { s.append(serv) };

            FloodgateAppServiceCrew {
                crew_id: c.crew_id,
                is_locked: c.is_locked,
                manager_address: c.manager_address,
                is_automated_feeding_enabled: c.is_automated_feeding_enabled,
                default_feeding_inventory: self.service_crew_feeding_inventories.read(service_crew_id),
                services: s.span(),
            }
        }

        fn resupply_food_internal(ref self: ContractState, service_crew_id: u64, source_inventory: InfluenceInventory, food_kg: u64) {
            let mut call_data: Array<felt252> = ArrayTrait::new();

            // source inventory
            call_data.append(source_inventory.inventory_type.into());
            call_data.append(source_inventory.inventory_id.into());
            call_data.append(source_inventory.inventory_slot.into());

            // food quantity
            call_data.append(food_kg.into());

            // caller crew
            call_data.append(1);
            call_data.append(service_crew_id.into());

            IInfluenceDispatcherContractDispatcher { contract_address: self.influence_dispatcher_contract_address.read() }.run_system('ResupplyFood', call_data);
        }
    }
}
