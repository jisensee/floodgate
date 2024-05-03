use starknet::ContractAddress;
use starknet::ClassHash;

#[starknet::interface]
pub trait ISwayContract<T> {
    fn balance_of(self: @T, account: ContractAddress) -> u256;
    fn transfer(ref self: T, recipient: ContractAddress, amount: u256) -> bool;
    fn transfer_from(ref self: T, sender: ContractAddress, recipient: ContractAddress, amount: u256) -> bool;
}

#[starknet::interface]
pub trait IInfluenceDispatcherContract<T> {
    fn run_system(ref self: T, name: felt252, calldata: Array<felt252>) -> felt252;
}

#[starknet::interface]
trait OwnableTrait<T>
{
    fn transfer_ownership(ref self: T, new_owner: ContractAddress);
    fn get_owner(self: @T) -> ContractAddress;
}

#[starknet::interface]
trait UpgradableTrait<T>
{
    fn upgrade_class_hash(ref self: T, new_class_hash: ClassHash);
}

#[starknet::interface]
trait LockableTrait<T>
{
    fn lock(ref self: T);
    fn unlock(ref self: T);
    fn is_locked(self: @T) -> bool;
}

#[starknet::interface]
trait CrewHolderTrait<T>
{
    fn set_crew_id(ref self: T, new_crew_id: u64);
    fn get_crew_id(self: @T) -> u64;
    fn refill_crew_rations(ref self: T, inventory_type: u64, inventory_id: u64, inventory_slot: u64, food_kg: u64);
    fn refuel_ship(ref self: T, inventory_type: u64, inventory_id: u64, inventory_slot: u64, ship_id:u64, fuel_kg: u64);
    fn set_influence_dispatcher(ref self: T, influence_dispatcher_address: ContractAddress);
}

#[starknet::interface]
trait ChargeableServiceTrait<T>
{
    fn set_sway_address(ref self: T, sway_address: ContractAddress);
    fn set_sway_fee(ref self: T, amount: u64);
    fn get_sway_fee(self: @T) -> u64;
    fn get_current_sway_balance(self: @T) -> u256;
    fn withdraw_sway_balance(ref self: T, amount: u256);
}

#[starknet::contract]
mod InfluenceOverfueler
{
    use super::{ ContractAddress, ClassHash };
    use starknet::{ SyscallResultTrait, syscalls };

    use starknet::get_caller_address;
    use starknet::get_contract_address;
    
    use starknet::contract_address_to_felt252;

    use super::IInfluenceDispatcherContractDispatcher;
    use super::IInfluenceDispatcherContractDispatcherTrait;
    use super::ISwayContractDispatcher;
    use super::ISwayContractDispatcherTrait;

    #[storage]
    struct Storage {
        lock_status: bool,
        owner: ContractAddress,
        dispatcher_address: ContractAddress,
        crew_id: u64,
        service_fee_sway: u64,
        sway_address: ContractAddress,
    }

    #[constructor]
    fn constructor(ref self: ContractState, init_owner: ContractAddress) {
        self.owner.write(init_owner);
        self.lock_status.write(true);
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
            self.owner.write(new_owner);
        }

        fn get_owner(self: @ContractState) -> ContractAddress {
            self.owner.read()
        }
    }

    #[abi(embed_v0)]
    impl LockableImpl of super::LockableTrait<ContractState>
    {
        fn lock(ref self: ContractState) {
            self.only_owner();
            self.lock_status.write(true);
        }

        fn unlock(ref self: ContractState) {
            self.only_owner();
            self.lock_status.write(false);
        }

        fn is_locked(self: @ContractState) -> bool {
            self.lock_status.read()
        }
    }

    #[generate_trait]
    impl PrivateMethods of PrivateMethodsTrait
    {
        fn only_owner(self: @ContractState) {
            let caller = get_caller_address();
            assert(caller == self.owner.read(), 'Caller is not the owner');
        }

        fn only_unlocked(self: @ContractState) {
            assert(self.is_locked() == false, 'The service is unavailable')
        }

        fn charge_service_fee(self: @ContractState, amount: u64) {
            ISwayContractDispatcher { contract_address: self.sway_address.read() }.transfer_from(get_caller_address(), get_contract_address(), amount.into());
        }
    }

    #[abi(embed_v0)]
    impl CrewHolderImpl of super::CrewHolderTrait<ContractState>
    {
        fn set_crew_id(ref self: ContractState, new_crew_id: u64) {
            self.only_owner();
            self.crew_id.write(new_crew_id);
        }
        
        fn get_crew_id(self: @ContractState) -> u64 {
            self.crew_id.read()
        }

        fn refill_crew_rations(ref self: ContractState, inventory_type: u64, inventory_id: u64, inventory_slot: u64, food_kg: u64) {

            self.only_unlocked();

            let mut call_data: Array<felt252> = ArrayTrait::new();

            // source inventory
            call_data.append(inventory_type.into());
            call_data.append(inventory_id.into());
            call_data.append(inventory_slot.into());

            // food quantity
            call_data.append(food_kg.into());

            // caller crew
            call_data.append(1);
            call_data.append(self.crew_id.read().into());

            IInfluenceDispatcherContractDispatcher { contract_address: self.dispatcher_address.read() }.run_system('ResupplyFood', call_data);
        }

        fn refuel_ship(ref self: ContractState, inventory_type: u64, inventory_id: u64, inventory_slot: u64, ship_id:u64, fuel_kg: u64) {

            self.only_unlocked();
            
            let mut call_data: Array<felt252> = ArrayTrait::new();

            // source inventory
            call_data.append(inventory_type.into());
            call_data.append(inventory_id.into());
            call_data.append(inventory_slot.into());
            
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
            call_data.append(self.crew_id.read().into());

            IInfluenceDispatcherContractDispatcher { contract_address: self.dispatcher_address.read() }.run_system('SendDelivery', call_data);

            let fee = self.service_fee_sway.read();
            if fee > 0
            {
                self.charge_service_fee(fee);
            }
        }

        fn set_influence_dispatcher(ref self: ContractState, influence_dispatcher_address: ContractAddress) {
            self.only_owner();
            self.dispatcher_address.write(influence_dispatcher_address);
        }
    }

    #[abi(embed_v0)]
    impl ChargeableServiceImpl of super::ChargeableServiceTrait<ContractState>
    {
        fn set_sway_address(ref self: ContractState, sway_address: ContractAddress) {
            self.only_owner();
            self.sway_address.write(sway_address);
        }

        fn set_sway_fee(ref self: ContractState, amount: u64) {
            self.only_owner();
            self.service_fee_sway.write(amount);
        }

        fn get_sway_fee(self: @ContractState) -> u64 {
            self.service_fee_sway.read()
        }

        fn get_current_sway_balance(self: @ContractState) -> u256 {
            ISwayContractDispatcher { contract_address: self.sway_address.read() }.balance_of(get_contract_address())
        }

        fn withdraw_sway_balance(ref self: ContractState, amount: u256) {
            self.only_owner();
            ISwayContractDispatcher { contract_address: self.sway_address.read() }.transfer(get_caller_address(), amount);
        }
    }
}