"""
Tests for SageAI Wave 6 Phase 6.4: Symbolic Binary Execution & Polymorphic De-Obfuscation.
"""

from app.services.binary_deobfuscator.symbolic_deobfuscator import (
    symbolic_binary_deobfuscator,
)


def test_unhash_apis_known():
    hashes = ["0x006a4abc", "0x00d83d7f"]
    res = symbolic_binary_deobfuscator.unhash_apis(hashes, algorithm="ROR13")
    assert len(res) == 2
    assert res[0]["api_name"] == "VirtualAlloc"
    assert res[0]["dll"] == "kernel32.dll"
    assert res[1]["api_name"] == "WriteProcessMemory"


def test_solve_opaque_predicates():
    exprs = [
        "(x * (x + 1)) % 2 == 0",
        "7 * y == 7 * y + 1",
    ]
    res = symbolic_binary_deobfuscator.solve_opaque_predicates(exprs)
    assert len(res) == 2
    assert res[0]["evaluation"] == "ALWAYS_TRUE"
    assert res[1]["evaluation"] == "ALWAYS_FALSE"


def test_deobfuscate_control_flow():
    res = symbolic_binary_deobfuscator.deobfuscate_control_flow(
        sample_name="LummaStealer_Packed_Dropper.bin",
        operator="TestReverseEngineer",
    )
    assert res["status"] == "success"
    assert res["cff_dispatcher_flattened"] is True
    assert len(res["unhashed_apis"]) >= 4
    assert len(res["decrypted_strings"]) >= 3
    assert (
        "https://c2-darknode.darkmesh-intel.ru/gate.php"
        in res["decrypted_strings"][0]["plaintext"]
    )
    assert "rule SageAI_Deobfuscated_" in res["yara_l_rule"]
    assert res["complexity_reduction"] == "85.7%"


def test_get_sample_library():
    samples = symbolic_binary_deobfuscator.get_sample_library()
    assert len(samples) >= 3
    assert any("LummaStealer" in s["sample_name"] for s in samples)
